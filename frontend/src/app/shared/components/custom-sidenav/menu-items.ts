import { UserRole } from '../../../common/roles.enum';

export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  roles?: UserRole[];
};

export const menuItems: MenuItem[] = [
  {
    icon: 'list_alt',
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
    icon: 'list_alt',
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
    icon: 'list_alt',
    label: 'Detalles del negocio',
    route: 'users/detail',
    roles: [UserRole.COMPANY, UserRole.EMPRESA_DISTRIBUIDOR],
  },
  {
    icon: 'format_list_bulleted',
    label: 'Configuración',
    route: 'configuracion',
    roles: [UserRole.ADMIN],
    subItems: [
      {
        icon: 'settings_applications',
        label: 'Empresa - Sucursal',
        route: 'settings',
      },
      {
        icon: 'group',
        label: 'Usuarios',
        route: 'users',
      },

      {
        icon: 'settings_applications',
        label: 'Tarifas de Envío',
        route: 'shipping-rates',
      },
      {
        icon: 'settings_applications',
        label: 'Distritos',
        route: 'districts',
      },
    ],
  },

  {
    icon: 'format_list_bulleted',
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
        icon: 'add',
        label: 'Nuevo Pedido',
        route: 'orders/create',
      },
      {
        icon: 'shopping_basket',
        label: 'Pedidos',
        route: 'orders',
      },
    ],
  },
  {
    icon: 'shopping_basket',
    label: 'Pedidos',
    route: 'orders',
    roles: [UserRole.MOTORIZED],
  },
  {
    icon: 'list_alt',
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
    icon: 'list_alt',
    label: 'Pedidos entregados',
    route: 'orders-delivered',
    roles: [
      UserRole.ADMIN,
      UserRole.COMPANY,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
  {
    icon: 'list_alt',
    label: 'Planes de Rutas',
    route: 'planning-events',
    roles: [UserRole.ADMIN, UserRole.RECEPTIONIST],
  },
  {
    icon: 'shopping_basket',
    label: 'Mis Rutas',
    route: 'my-orders',
    roles: [UserRole.MOTORIZED],
  },
  {
    icon: 'analytics',
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
    icon: 'analytics',
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
    icon: 'article',
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
    icon: 'assignment',
    label: 'Registros de Envios',
    route: 'registros-distribuidor',
    roles: [
      UserRole.ADMIN,
      UserRole.RECEPTIONIST,
      UserRole.EMPRESA_DISTRIBUIDOR,
    ],
  },
];
