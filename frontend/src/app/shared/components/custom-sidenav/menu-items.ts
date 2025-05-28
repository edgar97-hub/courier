export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  roles?: string[];
  key?: string;
};

export const menuItems: MenuItem[] = [
  {
    icon: 'list_alt',
    label: 'Tarifas',
    route: 'tarifas',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'CLIENTE', 'RECEPCIONISTA'],
  },
  {
    icon: 'list_alt',
    label: 'Detalles del negocio',
    route: 'users/detail/',
    roles: ['CLIENTE'],
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
        label: 'ditritos',
        route: 'districts',
      },
    ],
  },

  {
    icon: 'format_list_bulleted',
    label: 'Pedidos',
    route: 'orders',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'CLIENTE', 'RECEPCIONISTA'],

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
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'CLIENTE', 'RECEPCIONISTA'],
  },
  {
    icon: 'list_alt',
    label: 'Lista de cierre de caja',
    route: 'lista-cierre-caja',
    roles: ['ADMINISTRADOR', 'MOTORIZADO', 'CLIENTE', 'RECEPCIONISTA'],
  },
];
