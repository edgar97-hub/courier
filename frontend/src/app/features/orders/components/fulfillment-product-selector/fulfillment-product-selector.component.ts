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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { FulfillmentItem } from './fulfillment-product-selector.model';
import { OrderItem, PackageType, DistrictOption } from '../../models/order.model';

interface ProductVariation {
  id: string;
  code: number;
  sku: string;
  color?: string;
  size?: string;
  model?: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  product_id: string;
}

interface FulfillmentProduct {
  id: string;
  code: number;
  name: string;
  description?: string;
  company_id: string;
  variations: ProductVariation[];
}

interface InventoryRow {
  variation?: { id: string };
  stock: number;
}

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
    MatAutocompleteModule,
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

  variationsDisplayedColumns = ['sku', 'color', 'size', 'stock', 'dimensions', 'quantity', 'action'];
  desgloseColumns = ['description', 'medidas', 'cant', 'tipo', 'price', 'action'];

  products = signal<FulfillmentProduct[]>([]);
  selectedProduct = signal<FulfillmentProduct | null>(null);
  variationsWithStock = signal<(ProductVariation & { availableStock: number })[]>([]);
  standardGroupItems = signal<FulfillmentItem[]>([]);
  customItems = signal<(FulfillmentItem & { individualPrice: number })[]>([]);
  isLoadingProducts = signal(false);
  isLoadingVariations = signal(false);
  productSearchCtrl = signal('');
  selectedVariationQuantities = signal<Record<string, number>>({});

  filteredProducts = computed(() => {
    const search = this.productSearchCtrl().toLowerCase();
    const prods = this.products();
    if (!search) return prods;
    return prods.filter(p => p.name.toLowerCase().includes(search));
  });

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

  productDisplayFn(product: FulfillmentProduct | null): string {
    return product?.name || '';
  }

  loadProductsEffect = effect(() => {
    const cid = this.companyId();
    if (cid) {
      untracked(() => this.loadProducts());
    }
  });

  ngOnInit(): void {
    if (this.companyId()) {
      this.loadProducts();
    }
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

  loadProducts(): void {
    const companyId = this.companyId();
    if (!companyId) return;

    this.isLoadingProducts.set(true);
    this.http
      .get<FulfillmentProduct[]>(
        `${this.apiUrl}/fulfillment/stock-adjustments/products/by-company/${companyId}`,
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.snackBar.open('Error al cargar productos', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return of([]);
        }),
      )
      .subscribe(products => {
        this.products.set(products);
        this.isLoadingProducts.set(false);
      });
  }

  onProductSearchChange(value: string): void {
    this.productSearchCtrl.set(value);
  }

  onProductSelected(product: FulfillmentProduct): void {
    this.productSearchCtrl.set(product.name);
    this.selectedProduct.set(product);
    this.selectedVariationQuantities.set({});
    this.loadVariationsWithStock(product.id);
  }

  loadVariationsWithStock(productId: string): void {
    this.isLoadingVariations.set(true);

    this.http
      .get<ProductVariation[]>(
        `${this.apiUrl}/fulfillment/stock-adjustments/variations/by-product/${productId}`,
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        takeUntil(this.destroy$),
        switchMap(variations => {
          if (variations.length === 0) return of([]);
          return this.http
            .get<{ items: InventoryRow[]; total_count: number }>(
              `${this.apiUrl}/fulfillment/inventory/query?page_number=1&page_size=1000&filter_company_id=${this.companyId()}&filter_product_id=${productId}`,
              { headers: this.getAuthHeaders() },
            )
            .pipe(
              map(inventoryResponse => {
                const stockMap = new Map<string, number>();
                for (const row of inventoryResponse.items) {
                  const vId = (row as any).variation?.id;
                  if (vId) stockMap.set(vId, row.stock);
                }
                return variations.map(v => ({
                  ...v,
                  availableStock: stockMap.get(v.id) || 0,
                }));
              }),
              catchError(() => {
                return of(
                  variations.map(v => ({ ...v, availableStock: 0 })),
                );
              }),
            );
        }),
        catchError(() => {
          this.snackBar.open('Error al cargar variaciones', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return of([]);
        }),
      )
      .subscribe(variationsWithStock => {
        this.variationsWithStock.set(variationsWithStock);
        this.isLoadingVariations.set(false);
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

  incrementQuantity(variation: ProductVariation & { availableStock: number }): void {
    const current = this.getVariationQuantity(variation.id);
    if (current < variation.availableStock) {
      this.setVariationQuantity(variation.id, current + 1);
    }
  }

  decrementQuantity(variation: ProductVariation & { availableStock: number }): void {
    const current = this.getVariationQuantity(variation.id);
    if (current > 0) {
      this.setVariationQuantity(variation.id, current - 1);
    }
  }

  canAddVariation(variation: ProductVariation & { availableStock: number }): boolean {
    const qty = this.getVariationQuantity(variation.id);
    return qty > 0 && qty <= variation.availableStock;
  }

  addVariationToItems(variation: ProductVariation & { availableStock: number }): void {
    const qty = this.getVariationQuantity(variation.id);

    if (qty <= 0) {
      this.snackBar.open('Ingrese una cantidad válida', 'Cerrar', {
        duration: 2000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const product = this.selectedProduct();
    if (!product) return;

    const existingQty =
      this.standardGroupItems()
        .filter(i => i.variationId === variation.id)
        .reduce((s, i) => s + i.quantity, 0) +
      this.customItems()
        .filter(i => i.variationId === variation.id)
        .reduce((s, i) => s + i.quantity, 0);

    if (existingQty + qty > variation.availableStock) {
      this.snackBar.open(
        `Stock insuficiente: ya tiene ${existingQty} unidades en la lista, disponible ${variation.availableStock}`,
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
      availableStock: variation.availableStock,
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
    return this.canFitInStandard(drag.data);
  };

  getOrderItems(): OrderItem[] {
    const districtId = this.deliveryDistrictId();
    if (!districtId) return [];

    const info = this.principalInfo();
    const fulfillmentGroupId = crypto.randomUUID();

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
