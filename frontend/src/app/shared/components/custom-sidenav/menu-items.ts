export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  roles?: string[];
  externalLink?: string;
  key?: string;
};

export const menuItems: MenuItem[] = [
  {
    icon: 'list_alt',
    label: 'Tarifas',
    route: 'configuracion/tarifas',
    roles: ['ADMIN', 'MOTORIZED', 'CUSTOMER', 'RECEPTIONIST'],
  },
  {
    icon: 'list_alt',
    label: 'Detalles del negocio',
    route: 'configuracion/users/detail/',
    roles: ['CUSTOMER'],
  },
  {
    icon: 'format_list_bulleted',
    label: 'Configuración',
    route: 'configuracion',
    roles: ['ADMIN'],
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
        label: 'ditritos',
        route: 'districts',
      },
    ],
  },

  {
    icon: 'format_list_bulleted',
    label: 'Pedidos',
    route: 'orders',
    roles: ['ADMIN', 'MOTORIZED', 'CUSTOMER', 'RECEPTIONIST'],

    subItems: [
      {
        icon: 'add',
        label: 'Nuevo Pedido',
        route: '/orders/create',
      },
      {
        icon: 'shopping_basket',
        label: 'Pedidos',
        route: 'orders',
      },
    ],
  },
  {
    icon: 'list_alt',
    label: 'Pedidos entregados',
    route: 'orders-delivered',
    roles: ['ADMIN', 'MOTORIZED', 'CUSTOMER', 'RECEPTIONIST'],
  },
];
