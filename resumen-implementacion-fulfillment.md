# Resumen de Implementación — Módulo Fulfillment e Inventario

**URL de prueba:** http://161.132.41.184:5002/login  
**Usuario:** soporte@gmail.com  
**Contraseña:** qwerty

---

## 🧭 Portal del Usuario Empresa

### 1. Menú Lateral
- **"Mi Stock"** → Consulta tus productos con stock disponible. Puedes buscar por nombre, SKU, color, talla o modelo. Las filas con stock bajo se marcan en rojo.
- **"Mis Movimientos"** → Historial completo de entradas y salidas de tu inventario vinculadas a tu cuenta.

### 2. Crear Pedido Fulfillment

**Paso a paso:**

1. Ve a **Pedidos > Nuevo Pedido**
2. En el formulario, selecciona **"FULFILLMENT"** como Tipo de envío
3. Se ocultarán los campos manuales de paquetes y aparecerá el **buscador de inventario**
4. **Busca productos** por nombre, SKU, color, talla o modelo
5. Elige la **cantidad** y haz clic en **"+ Agregar"**
   - Si el producto cabe junto con otros en un paquete estándar, se agrupará automáticamente
   - Si excede las dimensiones o el grupo está lleno, pasará a "Paquetes Personalizados"
6. Puedes **arrastrar productos** entre las tablas "Paquete Estándar" y "Paquetes Personalizados"
7. El sistema calcula automáticamente:
   - **Principal**: el bulto de mayor costo (paga tarifa completa)
   - **Adicionales**: reciben el % de descuento configurado
8. Completa los datos del destinatario y haz clic en **"+ AGREGAR PEDIDO AL LISTADO"**
9. En la tabla final, haz clic en **"Haz click aquí para guardar los pedidos"**

### 3. Si NO tienes Fulfillment habilitado
Al seleccionar "FULFILLMENT" verás un **banner promocional** con información del servicio. Para activarlo, contacta al administrador.

---

## ⚙️ Panel del Administrador

### Habilitación del Servicio Fulfillment
- En **Usuarios > Editar usuario**, hay un toggle **"Servicio Fulfillment"** que activa/desactiva el servicio para cada empresa
- Solo las empresas con este toggle activado pueden crear pedidos Fulfillment y acceder al inventario

### Configuración de Settings (reorganización visual)
- **Imágenes**: Logotipo, fondo de login, banner de tarifas, banner promocional de inicio
- **Banner Fulfillment**: Imagen promocional que ven las empresas sin el servicio habilitado (sección Imágenes en Settings)

### Gestión de Productos
- Menú **Fulfillment > Productos**: Crear productos con múltiples variaciones (SKU, color, talla, modelo, dimensiones)
- Menú **Fulfillment > Ingresos y Ajustes**: Registrar movimientos de stock manuales
- Menú **Fulfillment > Consulta de Stock**: Ver el inventario completo de todas las empresas
- Menú **Fulfillment > Kardex**: Auditoría completa de todos los movimientos

### Reversión por Anulación
Cuando un pedido Fulfillment se **anula**, el sistema automáticamente devuelve el stock al inventario y registra la reversión en el Kardex.

---

## 📝 Notas importantes
- El buscador de productos utiliza filtro del lado del servidor — escribe y automáticamente busca en producto, SKU, color, talla y modelo
- Los descuentos multi-paquete se aplican tanto a pedidos normales como a Fulfillment
- El stock se descuenta en el backend al guardar los pedidos, no antes
