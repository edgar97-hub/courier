export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  roles?: string[];
};

export const menuItems: MenuItem[] = [
  {
    icon: 'list_alt',
    label: 'Inicio',
    route: 'dashboard',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'EMPRESA', 'RECEPCIONISTA'],
  },
  {
    icon: 'list_alt',
    label: 'coverageMapLink',
    route: 'dashboard',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'EMPRESA', 'RECEPCIONISTA'],
  },
  {
    icon: 'list_alt',
    label: 'Tarifas',
    route: 'tarifas',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'EMPRESA', 'RECEPCIONISTA'],
  },
  {
    icon: 'list_alt',
    label: 'Detalles del negocio',
    route: 'users/detail',
    roles: ['EMPRESA'],
  },
  {
    icon: 'format_list_bulleted',
    label: 'Configuración',
    route: 'configuracion',
    roles: ['ADMINISTRADOR'],
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
    roles: ['ADMINISTRADOR', 'EMPRESA', 'RECEPCIONISTA'],
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
    roles: ['MOTORIZADO'],
  },
  {
    icon: 'list_alt',
    label: 'Pedidos entregados',
    route: 'orders-delivered',
    roles: ['ADMINISTRADOR', 'EMPRESA', 'RECEPCIONISTA'],
  },
  {
    icon: 'analytics',
    label: 'Reportes',
    route: 'lista-cierre-caja',
    roles: ['ADMINISTRADOR', 'EMPRESA', 'RECEPCIONISTA'],
  },
  {
    icon: 'calculate',
    label: 'Calculadora',
    route: 'package-calculator',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'EMPRESA', 'RECEPCIONISTA'],
  },
  {
    icon: 'article',
    label: 'Terminos y condiciones',
    route: 'terms-and-conditions',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'EMPRESA', 'RECEPCIONISTA'],
  },
];
