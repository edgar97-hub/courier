Aquí tienes el texto íntegro de la propuesta técnica y económica extraído y formateado en Markdown:

---

# Propuesta Técnica y Económica
**Proyecto:** Módulo de Fulfillment e Inventario - JN Courier  
**Fecha:** 14 de Julio de 2026  
**Elaborado por:** TechFlux

---

## I. Módulo de Administración de JN Courier (Rol: ADMINISTRADOR)

El Administrador tiene el control de la configuración, el catálogo de productos, los ingresos físicos de stock y la auditoría.

**Nota de Alcance:** Toda la lógica de control de inventario, consulta de stock y Kardex de esta propuesta está diseñada para operar bajo un **único almacén físico centralizado** (Almacén Central de JN Courier).

### Acción 1: Habilitación de Servicio
*   **Pantalla/Ruta del Sistema:** Módulo Usuarios > Buscar y seleccionar un usuario > Editar Perfil / Vista Detalle.
*   **Elemento UI:** Se agrega un componente interactivo tipo Switch (Toggle) denominado **"Servicio Fulfillment"** (desactivado por defecto).
*   **Comportamiento del Sistema:**
    *   Si está en **OFF**, el cliente no tiene acceso al inventario ni puede ver el tipo de pedido "Fulfillment".
    *   Si está en **ON**, se habilitan automáticamente las credenciales para que el cliente visualice su stock en su propio portal y el tipo de pedido "Fulfillment" en su selector de envíos.

### Acción 2: Registro de Catálogo de Productos y Variaciones
*   **Pantalla/Ruta del Sistema:** Nuevo Menú Fulfillment > Pestaña Productos > Botón + Crear Producto.
*   **Formulario de Creación (Campos de entrada):**
    *   **Datos Generales del Producto (Padre):**
        *   *Selector (Dropdown):* Cliente (Solo clientes con "Servicio Fulfillment" en ON).
        *   *Input de Texto:* Nombre del Producto (Ejemplo: Polo Algodón Pima).
        *   *Input de Texto:* Descripción (Ejemplo: Polo 100% algodón, cuello redondo).
    *   **Sección Dinámica "Variaciones del Producto" (Hijos):**
        Un botón "+ Agregar Variación" despliega una fila en una tabla interna con los siguientes campos obligatorios por cada variación que se desee registrar:
        *   *Input de Texto:* SKU (Código único. Ejemplo: POL-PIM-ROJ-M).
        *   *Input de Texto:* Color (Ejemplo: Rojo).
        *   *Input de Texto:* Talla (Ejemplo: M).
        *   *Input de Texto:* Modelo / Característica adicional (Opcional. Ejemplo: Cuello Redondo).
        *   *Input Numérico:* Largo (cm) (Ejemplo: 30).
        *   *Input Numérico:* Ancho (cm) (Ejemplo: 20).
        *   *Input Numérico:* Alto (cm) (Ejemplo: 15).
        *   *Input Numérico:* Peso (kg) (Ejemplo: 0.5).
        *   *Input Numérico (Opcional):* **Stock Mínimo (Alerta)** (Ejemplo: 5. Si se deja vacío, el sistema asume por defecto 5 unidades. Si el stock disponible desciende a este número o menos, el sistema activará la alerta visual de stock bajo).

*   **Comportamiento al Guardar:** El sistema registra en la base de datos un único registro en la tabla de Productos (Padre), y múltiples registros en la tabla de Variaciones (Hijos) vinculados a ese producto. Todas las variaciones se crean con un Stock Disponible inicial de 0.

### Acción 3: Registro de Movimiento Manual (Ingresos y Ajustes de Stock)
*   **Pantalla/Ruta del Sistema:** Nuevo Menú Fulfillment > Pestaña Ingresos y Ajustes > Botón + Registrar Movimiento.
*   **Formulario de Registro (Campos de entrada y reactividad):**
    *   *Selector (Dropdown):* Cliente.
    *   *Selector (Dropdown reactivo):* Producto (Solo muestra los productos del cliente seleccionado).
    *   *Selector (Dropdown reactivo):* Variación / SKU.
        *   *Comportamiento:* Al elegir el producto, este selector se activa y muestra únicamente sus variaciones en formato: `[SKU] - Color: [Color] | Talla: [Talla]` (Ejemplo: POL-PIM-ROJ-M - Color: Rojo | Talla: M).
    *   *Selector (Dropdown):* Tipo de Operación (Ingreso por Abastecimiento, Ajuste Manual - Suma, Ajuste Manual - Resta).
    *   *Input Numérico:* Cantidad (Enteros positivos).
    *   *Área de Texto (Textarea):* Observación / Motivo (Obligatorio).
*   **Comportamiento al Guardar:** El sistema actualiza el stock físico de la Variación seleccionada y genera el registro en el Kardex asociando tanto el Producto Padre como los datos específicos de la Variación (Color, Talla, SKU).

### Acción 4: Consulta de Stock Maestro (Inventario en Tiempo Real)
*   **Pantalla/Ruta del Sistema:** Nuevo Menú Fulfillment > Pestaña Consulta de Stock.
*   **Elementos UI:**
    *   **Filtros de Búsqueda:** Filtrar por usuario (empresa), Filtrar por Producto (Padre), Filtrar por SKU/Variación.
    *   **Filtro Rápido (Switch/Checkbox):** "Mostrar solo productos con stock bajo" (Al activarse, la tabla muestra únicamente los artículos cuyo stock disponible sea igual o menor a su Stock Mínimo (Alerta)).
    *   **Tabla de Datos (Columnas visibles):**
        *   Usuario (empresa).
        *   Producto (Nombre del producto padre).
        *   SKU / Variación (Color, Talla, Modelo).
        *   Stock Disponible (Cantidad física en almacén).
        *   Estado (Badge de color **Verde / "Normal"** o badge color **Rojo / "Stock Bajo"**).

### Acción 5: Visualización de Kardex Histórico (Solo Lectura y Filtros)
*   **Pantalla/Ruta del Sistema:** Nuevo Menú Fulfillment > Pestaña Kardex.
*   **Elementos UI:**
    *   **Filtros de Búsqueda:** Filtro por Cliente, Filtro por SKU/Producto, Selector de Rango de Fechas.
    *   **Tabla de Datos (Columnas visibles):**
        *   Fecha y Hora (Zonificación America/Lima).
        *   Usuario (empresa).
        *   Producto (Nombre del producto padre).
        *   Variación (Detalle: SKU | Color | Talla).
        *   Tipo de Movimiento (Valores exactos: Ingreso por Abastecimiento, Salida por Pedido, Ajuste Manual - Suma, Ajuste Manual - Resta, Reversión por Anulación).
        *   Cantidad Operada (Ejemplo: +100 o -5).
        *   Saldo Resultante (El stock físico neto después de aplicar la operación).
        *   Usuario Responsable (Nombre del administrador que guardó el movimiento manual, o "Sistema" en caso de salidas de pedidos).
        *   Observación / Motivo (Texto ingresado por el Admin en la Acción 3, o el ID del Pedido en caso de salidas).

---

## II. Portal del Usuario (Rol: Empresa)

**Regla de Acceso (Fulfillment Desactivado):** Si el usuario no tiene habilitado el "Servicio Fulfillment", al ingresar a la pestaña "Mi Inventario" o al seleccionar "Fulfillment" en el tipo de envío, el sistema mostrará un banner promocional interactivo destacando los beneficios de almacenamiento y despacho de JN Courier.

El cliente de JN Courier tiene acceso restringido, enfocado únicamente en la consulta de su mercadería y en la creación de pedidos que consuman su stock.

### Acción 1: Consulta de Stock y Movimientos ("Mi Inventario")
*   **Pantalla/Ruta del Sistema:** Menú Lateral > Pestaña Mi Inventario.
*   **UI y Pestañas Internas:**
    *   **Pestaña 1: "Mi Stock Actual" (Solo Lectura):**
        *   Muestra la tabla de sus productos: *Producto, SKU, Color, Talla, Stock Disponible.*
        *   Si alguna variación está por debajo de su stock mínimo, la fila resalta el estado en color **Rojo ("Stock Bajo")**.
        *   *Filtro Rápido:* Switch de un solo clic para filtrar y ver únicamente sus productos con stock bajo.
    *   **Pestaña 2: "Mis Movimientos" (Kardex Simplificado - Solo Lectura):**
        *   Muestra el historial de entradas (registradas por el administrador) y salidas (por los pedidos generados) vinculadas a su cuenta, manteniendo transparencia absoluta del stock físico.

### Acción 2: Creación de Pedido "Fulfillment" (Módulo "Registrar Pedido")

*   **Paso 1: Configuración Inicial del Envío**
    *   Selección de Tipo de Envío: El usuario selecciona **"Fulfillment"** en el selector "Tipo de envío".
    *   **Comportamiento del Sistema (UI):**
        *   Se ocultan/deshabilitan los campos manuales de "Tamaño del paquete" y "Añadir Paquete a la Lista".
        *   Se despliega inmediatamente la sección **"Productos del Inventario"**.

*   **Paso 2: Selección de Mercadería y Cotización Automática**
    *   **Selección de Producto y Variación:** El usuario elige el Producto (Padre) y la Variación (Hijo) en la sección de inventario. El sistema muestra dinámicamente el stock real disponible para ese SKU.
    *   **Validación de Cantidad:** El usuario ingresa la cantidad a enviar. Si Cantidad > Stock disponible, el botón + Agregar Producto se bloquea y se muestra la alerta en rojo: *"Cantidad supera el stock disponible"*.
    *   **Adición de Ítems y Mapeo de Dimensiones:** Al hacer clic en + Agregar Producto, el sistema jala automáticamente las dimensiones y peso (largo, ancho, alto, peso) registradas en la configuración de la variación seleccionada.
    *   **Cálculo de Tarifas (Lógica de Descuento Actual):** El sistema añade el artículo a la tabla de "Desglose de Paquetes" y aplica de inmediato el motor de tarifas existente:
        *   El bulto con el mayor costo base se determina como el **"Principal"** (100% de su tarifa).
        *   Los bultos restantes se marcan automáticamente como **"Adicional"**, aplicando el % Descuento Adicional según la configuración del sistema (Ejemplo: 10%).
        *   El campo "Costo de envío" se calcula dinámicamente con la suma final obtenida (Ejemplo: S/ 45.00).

*   **Paso 3: Adición de Datos de Destino y Preparación de la Orden**
    *   El usuario completa los campos obligatorios del destinatario: *Nombre, Teléfono, Distrito, Dirección de entrega, Coordenadas y Fecha de entrega.*
    *   Completa los campos de cobro: *Monto total a cobrar (si aplica) y Método de pago.*
    *   **Adición a la Lista de Carga:** El usuario hace clic en el botón naranja **"+ AGREGAR PEDIDO AL LISTADO"**.
        *   El pedido se renderiza en la tabla de pedidos de resumen final al fondo de la pantalla, mostrando en la columna "Producto" el desglose del inventario seleccionado (Ejemplo: 2 Bultos: [SKU1] x1, [SKU2] x1).

*   **Paso 4: Procesamiento de Stock y Guardado (Backend)**
    *   Una vez que el usuario hace clic en **"Haz click aquí para guardar los pedidos"**:
    *   **Validación Transaccional:** El sistema verifica en backend que la cantidad solicitada siga disponible.
    *   **Descuento de Stock:** Se restan las unidades aprobadas del stock físico neto de cada variación.
    *   **Registro en Kardex:** Se genera de forma automática una fila en el Kardex marcada como **"SALIDA POR PEDIDO"** con las cantidades reducidas, el saldo restante y asociando el ID del pedido generado.

---

## III. Casos de Excepción y Reglas del Sistema (Lógica de Backend)

### Acción Especial: Reversión de Stock por Cancelación de Pedido
*   **Pantalla/Ruta del Sistema:** Módulo de Gestión de Pedidos (tanto para Admin de JN Courier como para el Cliente con permisos de cancelación).
*   **Regla de Negocio (Backend):**
    *   Si un pedido que fue registrado originalmente como tipo **"Fulfillment"** cambia su estado a **"Anulado"**:
    *   El sistema recupera automáticamente los SKUs y cantidades asociadas a ese pedido.
    *   **Suma (devuelve)** esas cantidades al stock disponible de los respectivos productos.
    *   Inserta automáticamente un registro de tipo **"REVERSIÓN POR ANULACION"** en el Kardex para mantener la trazabilidad exacta del motivo del incremento de stock.

---
 

 Nota: La sección actual de selección manual de tamaño (la que utiliza con los botones

Estándar / Paquetes Múltiples) se reemplazará por la sección de inventario de productos solo cuando el usuario seleccione el tipo "Fulfillment". El sistema registra automáticamente la capacidad máxima de su paquete estándar (hasta 5 kg y dimensiones para entrega motorizada). En función de esto, actúa automáticamente:

- Caso 1 (Consolidado - Todo cabe en una bolsa): Si su cliente agrega 3 polos (peso total de 1,5 kg, muy por debajo de 5 kg), el sistema agrupa los productos de manera lógica. Se generará automáticamente un único paquete estándar con su tarifa base normal (p. ej., S/ 34,00) en la tabla de envíos. Su cliente no paga demas por prenda ligera.

- Caso 2 (Excede el límite y se divide en varios paquetes): Si su cliente

añade un portátil pesado (10 kg) y dos polos (1 kg cada uno), el peso total (11 kg)

excede el límite. El sistema detecta automáticamente el exceso

y divide el envío en dos paquetes físicos separados:

- Paquete 1 (El portátil): Marcado como Paquete Principal (se paga la tarifa completa).

- Paquete 2 (Los dos polos combinados): Se marca como paquete Adicional (aplica el descuento de tus tarifas actuales) .
