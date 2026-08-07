import { UserRole } from '../../../common/roles.enum';

export type MenuItem = {
  icon: string;
  label: string;
  labelByRole?: Partial<Record<UserRole, string>>;
  route?: string;
  subItems?: MenuItem[];
  roles?: UserRole[];
  requiresFulfillment?: boolean;
};

export const menuItems: MenuItem[] = [
  {
    icon: 'dashboard',
    label: 'Inicio',
    route: 'dashboard',
    roles: [
      UserRole.ADMIN,
      UserRole.MOTORIZED,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'list_alt',
    label: 'coverageMapLink',
    route: 'dashboard',
    roles: [
      UserRole.ADMIN,
      UserRole.MOTORIZED,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'receipt_long',
    label: 'Tarifas',
    route: 'tarifas',
    roles: [
      UserRole.ADMIN,
      UserRole.MOTORIZED,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'business',
    label: 'Detalles del negocio',
    route: 'users/detail',
    roles: [UserRole.COMPANY, UserRole.EMPRESA_DISTRIBUIDOR],
  },
  {
    icon: 'settings',
    label: 'Configuración',
    route: 'configuracion',
    roles: [UserRole.ADMIN],
    subItems: [
      {
        icon: 'store',
        label: 'Empresa - Sucursal',
        route: 'settings',
      },
      {
        icon: 'percent',
        label: 'Ajustes de descuentos por volumen',
        route: 'settings-volume-discounts',
      },
      {
        icon: 'group',
        label: 'Usuarios',
        route: 'users',
      },
      {
        icon: 'local_shipping',
        label: 'Tarifas de Envío',
        route: 'shipping-rates',
      },
      {
        icon: 'location_city',
        label: 'Distritos',
        route: 'districts',
      },
    ],
  },
  {
    icon: 'inventory_2',
    label: 'Fulfillment',
    route: 'fulfillment',
    roles: [
      UserRole.ADMIN,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
    subItems: [
      {
        icon: 'category',
        label: 'Productos',
        route: 'fulfillment/products',
        roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
      },
      {
        icon: 'swap_vert',
        label: 'Ingresos y Ajustes',
        route: 'fulfillment/stock-adjustments',
        roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
      },
      {
        icon: 'visibility',
        label: 'Consulta de Stock',
        roles: [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.COMPANY, UserRole.EMPRESA_DISTRIBUIDOR],
        labelByRole: {
          [UserRole.COMPANY]: 'Mi Stock',
          [UserRole.EMPRESA_DISTRIBUIDOR]: 'Mi Stock',
        },
        route: 'fulfillment/stock-query',
        requiresFulfillment: true,
      },
      {
        icon: 'receipt_long',
        label: 'Kardex',
        roles: [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.COMPANY, UserRole.EMPRESA_DISTRIBUIDOR],
        labelByRole: {
          [UserRole.COMPANY]: 'Mis Movimientos',
          [UserRole.EMPRESA_DISTRIBUIDOR]: 'Mis Movimientos',
        },
        route: 'fulfillment/kardex',
        requiresFulfillment: true,
      },
    ],
  },
  {
    icon: 'shopping_cart',
    label: 'Pedidos',
    route: 'orders',
    roles: [
      UserRole.ADMIN,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
    subItems: [
      {
        icon: 'add_shopping_cart',
        label: 'Nuevo Pedido',
        route: 'orders/create',
      },
      {
        icon: 'shopping_cart',
        label: 'Pedidos',
        route: 'orders',
      },
    ],
  },
  {
    icon: 'shopping_cart',
    label: 'Pedidos',
    route: 'orders',
    roles: [UserRole.MOTORIZED],
  },
  {
    icon: 'assignment',
    label: 'Pedidos Registrados',
    route: 'orders-registered',
    roles: [
      UserRole.ADMIN,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'check_circle',
    label: 'Pedidos Entregados',
    route: 'orders-delivered',
    roles: [
      UserRole.ADMIN,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'assessment',
    label: 'Reporte de Descuento por volumen',
    route: 'reports-volume-discounts',
    roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
  },
  {
    icon: 'route',
    label: 'Planes de Rutas',
    route: 'planning-events',
    roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
  },
  {
    icon: 'directions_car',
    label: 'Mis Rutas',
    route: 'my-orders',
    roles: [UserRole.MOTORIZED],
  },
  {
    icon: 'bar_chart',
    label: 'Reportes',
    route: 'lista-cierre-caja',
    roles: [
      UserRole.ADMIN,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'attach_money',
    label: 'Gestión de Caja',
    route: 'cash-management',
    roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
  },
  {
    icon: 'calculate',
    label: 'Calculadora',
    route: 'package-calculator',
    roles: [
      UserRole.ADMIN,
      UserRole.MOTORIZED,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'gavel',
    label: 'Terminos y condiciones',
    route: 'terms-and-conditions',
    roles: [
      UserRole.ADMIN,
      UserRole.MOTORIZED,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'inventory_2',
    label: 'Registros de Envios',
    route: 'registros-distribuidor',
    roles: [
      UserRole.ADMIN,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
];
