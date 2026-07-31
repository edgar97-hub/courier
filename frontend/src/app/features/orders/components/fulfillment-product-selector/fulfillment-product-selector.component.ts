import {
  Component,
  inject,
  input,
  signal,
  computed,
  effect,
  untracked,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule, CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { Subject, Observable, of } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  startWith,
  tap,
  map,
} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { FulfillmentItem } from './fulfillment-product-selector.model';
import { OrderItem, PackageType, DistrictOption } from '../../models/order.model';

@Component({
  selector: 'app-fulfillment-product-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DragDropModule,
  ],
  templateUrl: './fulfillment-product-selector.component.html',
  styleUrls: ['./fulfillment-product-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FulfillmentProductSelectorComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  private readonly apiUrl = environment.apiUrl;

  deliveryDistrictId = input.required<string | number | null>();
  districtsCache = input.required<DistrictOption[]>();
  volumetricFactor = input.required<number>();
  staLengthCm = input.required<number>();
  staWidthCm = input.required<number>();
  staHeightCm = input.required<number>();
  staWeightKg = input.required<number>();
  companyId = input.required<string | null>();
  multiPackageDiscountPercent = input<number>(0);

  inventoryItems = signal<any[]>([]);
  standardGroupItems = signal<FulfillmentItem[]>([]);
  customItems = signal<(FulfillmentItem & { individualPrice: number })[]>([]);
  isLoadingInventory = signal(false);
  searchText = signal('');
  private searchDebounce: any;
  selectedVariationQuantities = signal<Record<string, number>>({});

  standardSumDimensions = computed(() => {
    const items = this.standardGroupItems();
    return {
      length: items.reduce((s, i) => s + i.length_cm * i.quantity, 0),
      width: items.reduce((s, i) => s + i.width_cm * i.quantity, 0),
      height: items.reduce((s, i) => s + i.height_cm * i.quantity, 0),
      weight: items.reduce((s, i) => s + i.weight_kg * i.quantity, 0),
    };
  });

  principalInfo = computed(() => {
    const standardItems = this.standardGroupItems();
    const customItems = this.customItems();
    const flatRate = this.getFlatRate();
    const discountPct = this.multiPackageDiscountPercent();
    const hasDiscount = discountPct > 0;

    interface RepItem { group: 'standard' | 'custom'; index: number; basePrice: number }
    const reps: RepItem[] = [];
    if (standardItems.length > 0) {
      reps.push({ group: 'standard', index: 0, basePrice: flatRate });
    }
    customItems.forEach((item, i) => {
      reps.push({ group: 'custom', index: i, basePrice: item.individualPrice });
    });

    const principal = reps.length > 0
      ? reps.reduce((max, r) => r.basePrice > max.basePrice ? r : max, reps[0])
      : null;

    return {
      flatRate,
      discountPct,
      hasDiscount,
      principal,
      isPrincipal: (group: 'standard' | 'custom', index: number): boolean => {
        if (!principal) return false;
        return principal.group === group && principal.index === index;
      },
      getFinalPrice: (group: 'standard' | 'custom', index: number, basePrice: number): number => {
        if (!hasDiscount) return basePrice;
        if (principal && principal.group === group && principal.index === index) return basePrice;
        return basePrice * (1 - discountPct / 100);
      },
    };
  });

  totalShippingCost = computed(() => {
    const info = this.principalInfo();
    const standardItems = this.standardGroupItems();
    const customItems = this.customItems();

    let total = 0;
    if (standardItems.length > 0) {
      const stdPrice = info.hasDiscount && !info.isPrincipal('standard', 0)
        ? info.flatRate * (1 - info.discountPct / 100)
        : info.flatRate;
      total += stdPrice;
    }
    customItems.forEach((item, i) => {
      const unitPrice = info.getFinalPrice('custom', i, item.individualPrice);
      total += unitPrice * item.quantity;
    });
    return total;
  });

  loadInventoryEffect = effect(() => {
    const cid = this.companyId();
    if (cid) {
      untracked(() => this.loadInventory());
    }
  });

  ngOnInit(): void {
    if (this.companyId()) {
      this.loadInventory();
    }
  }

  onSearchInput(value: string): void {
    this.searchText.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.loadInventory();
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { codrr_token: token } : {}),
    });
  }

  loadInventory(): void {
    const companyId = this.companyId();
    if (!companyId) return;

    this.isLoadingInventory.set(true);
    const search = this.searchText();
    let url = `${this.apiUrl}/fulfillment/inventory/query?page_number=1&page_size=200&filter_company_id=${companyId}`;
    if (search) {
      url += `&search_term=${encodeURIComponent(search)}`;
    }

    this.http
      .get<{ items: any[]; total_count: number }>(url, { headers: this.getAuthHeaders() })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.snackBar.open('Error al cargar inventario', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return of({ items: [], total_count: 0 });
        }),
      )
      .subscribe(response => {
        this.inventoryItems.set(response.items);
        this.isLoadingInventory.set(false);
        this.selectedVariationQuantities.set({});
      });
  }

  getVariationQuantity(variationId: string): number {
    return this.selectedVariationQuantities()[variationId] ?? 1;
  }

  setVariationQuantity(variationId: string, value: number): void {
    this.selectedVariationQuantities.update(qty => ({
      ...qty,
      [variationId]: Math.max(0, value),
    }));
  }

  incrementQuantity(row: any): void {
    const current = this.getVariationQuantity(row.variation.id);
    if (current < row.stock) {
      this.setVariationQuantity(row.variation.id, current + 1);
    }
  }

  decrementQuantity(row: any): void {
    const current = this.getVariationQuantity(row.variation.id);
    if (current > 0) {
      this.setVariationQuantity(row.variation.id, current - 1);
    }
  }

  canAddVariation(row: any): boolean {
    const qty = this.getVariationQuantity(row.variation.id);
    return qty > 0 && qty <= row.stock;
  }

  addVariationToItems(row: any): void {
    const variation = row.variation;
    const product = row.product;
    const stock = row.stock;
    const qty = this.getVariationQuantity(variation.id);

    if (qty <= 0) {
      this.snackBar.open('Ingrese una cantidad válida', 'Cerrar', {
        duration: 2000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (!product) return;

    const existingQty =
      this.standardGroupItems()
        .filter(i => i.variationId === variation.id)
        .reduce((s, i) => s + i.quantity, 0) +
      this.customItems()
        .filter(i => i.variationId === variation.id)
        .reduce((s, i) => s + i.quantity, 0);

    if (existingQty + qty > stock) {
      this.snackBar.open(
        `Stock insuficiente: ya tiene ${existingQty} unidades en la lista, disponible ${stock}`,
        'Cerrar',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
      return;
    }

    const newItem: FulfillmentItem = {
      tempId: `ful-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      variationId: variation.id,
      productId: product.id,
      productName: product.name,
      sku: variation.sku,
      color: variation.color,
      size: variation.size,
      model: variation.model,
      quantity: qty,
      availableStock: stock,
      length_cm: variation.length_cm,
      width_cm: variation.width_cm,
      height_cm: variation.height_cm,
      weight_kg: variation.weight_kg,
    };

    const fitsIndividually =
      newItem.length_cm <= this.staLengthCm() &&
      newItem.width_cm <= this.staWidthCm() &&
      newItem.height_cm <= this.staHeightCm() &&
      newItem.weight_kg <= this.staWeightKg();

    if (fitsIndividually) {
      const current = this.standardGroupItems();
      const addL = newItem.length_cm * newItem.quantity;
      const addW = newItem.width_cm * newItem.quantity;
      const addH = newItem.height_cm * newItem.quantity;
      const addWt = newItem.weight_kg * newItem.quantity;
      const sumL = current.reduce((s, i) => s + i.length_cm * i.quantity, 0) + addL;
      const sumW = current.reduce((s, i) => s + i.width_cm * i.quantity, 0) + addW;
      const sumH = current.reduce((s, i) => s + i.height_cm * i.quantity, 0) + addH;
      const sumWt = current.reduce((s, i) => s + i.weight_kg * i.quantity, 0) + addWt;

      if (
        sumL <= this.staLengthCm() &&
        sumW <= this.staWidthCm() &&
        sumH <= this.staHeightCm() &&
        sumWt <= this.staWeightKg()
      ) {
        this.standardGroupItems.update(items => [...items, newItem]);
      } else {
        this.customItems.update(items => [...items, { ...newItem, individualPrice: this.calculateIndividualPrice(newItem) }]);
      }
    } else {
      this.customItems.update(items => [...items, { ...newItem, individualPrice: this.calculateIndividualPrice(newItem) }]);
    }

    this.selectedVariationQuantities.update(q => ({
      ...q,
      [variation.id]: 0,
    }));
  }

  removeItem(tempId: string): void {
    const inStandard = this.standardGroupItems().some(i => i.tempId === tempId);
    if (inStandard) {
      this.standardGroupItems.update(items => items.filter(i => i.tempId !== tempId));
    } else {
      this.customItems.update(items => items.filter(i => i.tempId !== tempId));
    }
  }

  onDrop(event: CdkDragDrop<any[], any>): void {
    if (event.previousContainer === event.container) return;

    const item = event.item.data;

    const toStandard = event.container.data === this.standardGroupItems();

    if (toStandard) {
      if (!this.canFitInStandard(item)) {
        this.snackBar.open('Este paquete no cabe en el grupo estándar porque excede las dimensiones o peso máximo.', 'Cerrar', { duration: 4000 });
        return;
      }
      this.customItems.update(items => items.filter(i => i.tempId !== item.tempId));
      this.standardGroupItems.update(items => [...items, item]);
    } else {
      this.standardGroupItems.update(items => items.filter(i => i.tempId !== item.tempId));
      this.customItems.update(items => [...items, { ...item, individualPrice: this.calculateIndividualPrice(item) }]);
    }
  }

  canFitInStandard(item: FulfillmentItem): boolean {
    const staL = this.staLengthCm();
    const staW = this.staWidthCm();
    const staH = this.staHeightCm();
    const staWt = this.staWeightKg();

    if (
      item.length_cm > staL ||
      item.width_cm > staW ||
      item.height_cm > staH ||
      item.weight_kg > staWt
    ) {
      return false;
    }

    const current = this.standardGroupItems();
    const addL = item.length_cm * item.quantity;
    const addW = item.width_cm * item.quantity;
    const addH = item.height_cm * item.quantity;
    const addWt = item.weight_kg * item.quantity;
    const sumL = current.reduce((s, i) => s + i.length_cm * i.quantity, 0) + addL;
    const sumW = current.reduce((s, i) => s + i.width_cm * i.quantity, 0) + addW;
    const sumH = current.reduce((s, i) => s + i.height_cm * i.quantity, 0) + addH;
    const sumWt = current.reduce((s, i) => s + i.weight_kg * i.quantity, 0) + addWt;

    return sumL <= staL && sumW <= staW && sumH <= staH && sumWt <= staWt;
  }

  standardEnterPredicate = (drag: CdkDrag<FulfillmentItem>): boolean => {
    if (!this.canFitInStandard(drag.data)) {
      this.snackBar.open(
        'Este paquete no cabe en el grupo estándar porque excede las dimensiones.',
        'Cerrar',
        { duration: 3000 },
      );
      return false;
    }
    return true;
  };

  getOrderItems(): OrderItem[] {
    const districtId = this.deliveryDistrictId();
    if (!districtId) return [];

    const info = this.principalInfo();
    const fulfillmentGroupId = uuidv4();

    const standardItems: OrderItem[] = this.standardGroupItems().map((item, i) => ({
      package_type: PackageType.FULFILLMENT,
      description: `${item.sku} ${item.productName}${item.color ? ' / ' + item.color : ''}${item.size ? ' / ' + item.size : ''}`,
      length_cm: item.length_cm,
      width_cm: item.width_cm,
      height_cm: item.height_cm,
      weight_kg: item.weight_kg,
      basePrice: i === 0 ? info.flatRate : 0,
      finalPrice: i === 0
        ? (info.isPrincipal('standard', 0) ? info.flatRate : info.flatRate * (1 - info.discountPct / 100))
        : 0,
      isPrincipal: i === 0 && info.isPrincipal('standard', 0),
      variationId: item.variationId,
      productId: item.productId,
      quantity: item.quantity,
      fulfillmentGroupId,
    }));

    const customItems: OrderItem[] = this.customItems().map((item, i) => ({
      package_type: PackageType.FULFILLMENT,
      description: `${item.sku} ${item.productName}${item.color ? ' / ' + item.color : ''}${item.size ? ' / ' + item.size : ''}`,
      length_cm: item.length_cm,
      width_cm: item.width_cm,
      height_cm: item.height_cm,
      weight_kg: item.weight_kg,
      basePrice: item.individualPrice,
      finalPrice: info.getFinalPrice('custom', i, item.individualPrice),
      isPrincipal: info.isPrincipal('custom', i),
      variationId: item.variationId,
      productId: item.productId,
      quantity: item.quantity,
    }));

    return [...standardItems, ...customItems];
  }

  getFlatRate(): number {
    const districtId = this.deliveryDistrictId();
    if (!districtId) return 0;
    const district = this.districtsCache().find(d => d.id === districtId);
    return district ? parseFloat(district.price) || 0 : 0;
  }

  private calculateIndividualPrice(item: FulfillmentItem): number {
    const districtId = this.deliveryDistrictId();
    if (!districtId) return 0;

    const district = this.districtsCache().find(d => d.id === districtId);
    if (!district) return 0;

    const fitsStandard =
      item.length_cm <= this.staLengthCm() &&
      item.width_cm <= this.staWidthCm() &&
      item.height_cm <= this.staHeightCm() &&
      item.weight_kg <= this.staWeightKg();

    if (fitsStandard) {
      return parseFloat(district.price) || 0;
    }

    const volumetricFactor = this.volumetricFactor();
    if (!volumetricFactor) return 0;

    const pesoVolumetrico =
      (item.length_cm * item.width_cm * item.height_cm) / volumetricFactor;
    const pesoCobrado = Math.max(pesoVolumetrico, item.weight_kg);

    const tariffsForDistrict = this.districtsCache().filter(
      d => d.name === district.name,
    );

    for (const tariff of tariffsForDistrict) {
      const t = tariff as any;
      if (
        t.weight_from !== undefined &&
        t.weight_to !== undefined &&
        pesoCobrado >= t.weight_from &&
        pesoCobrado <= t.weight_to
      ) {
        return parseFloat(t.price) || 0;
      }
    }

    return 0;
  }
}
