#!/bin/bash

# --- Configuración Inicial ---
# Detiene la ejecución del script si cualquier comando falla. Esencial para la seguridad.
set -e

# --- Constantes y Variables ---
# Definir colores para una salida más legible.
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin Color

# Nombre de la aplicación en PM2. Centralizado para fácil modificación.
APP_NAME="courier-app"

# --- Inicio del Script ---
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN} Script de Despliegue del Sistema Courier (Híbrido) ${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo "Este script instalará la base de datos en Docker y la aplicación en el host."

# --- Paso 1: Verificación de Prerrequisitos ---
echo -e "\n${YELLOW}Paso 1: Verificando que las dependencias estén instaladas...${NC}"
command -v node >/dev/null || { echo -e "${RED}ERROR: Node.js no está instalado.${NC}"; exit 1; }
command -v npm >/dev/null || { echo -e "${RED}ERROR: npm no está instalado.${NC}"; exit 1; }
command -v docker >/dev/null || { echo -e "${RED}ERROR: Docker no está instalado.${NC}"; exit 1; }
command -v docker-compose >/dev/null || { echo -e "${RED}ERROR: Docker Compose no está instalado.${NC}"; exit 1; }
echo "Todas las dependencias principales han sido encontradas."

# --- Paso 2: Recopilación de Datos del Usuario ---
echo -e "\n${YELLOW}Paso 2: Recopilando información para la configuración...${NC}"
read -p "Introduce el dominio EXACTO para el despliegue (ej. app.cliente.com): " DOMAIN
read -p "Introduce un email de contacto (usado por Let's Encrypt): " EMAIL

# --- Paso 3: Generación del Archivo de Entorno (.env) ---
echo -e "\n${YELLOW}Paso 3: Generando el archivo de configuración .env...${NC}"
# Generamos credenciales seguras y aleatorias para la base de datos y JWT.
DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | fold -w 12 | head -n 1)
JWT_SECRET=$(openssl rand -base64 48)

# Usamos 'cat <<EOF' para crear un archivo multilínea de forma limpia.
cat <<EOF > .env
# Este archivo es generado automáticamente. NO lo subas a Git.

# --- Variables para Docker Compose (Base de Datos) ---
DB_NAME=courier_db
DB_USER=courier_user
DB_PASSWORD=${DB_PASSWORD}
PGADMIN_EMAIL=${EMAIL}
PGADMIN_PASSWORD=Yi48{:sew-dv6C;qz

# --- Variables para la Aplicación NestJS (ejecutada en el host) ---
DATABASE_URL=postgresql://courier_user:${DB_PASSWORD}@localhost:5432/courier_db
PORT=443
JWT_SECRET=${JWT_SECRET}
DOMAIN=${DOMAIN}
EOF
echo "Archivo .env creado con credenciales seguras."


# --- Paso 4: Despliegue de la Base de Datos con Docker ---
echo -e "\n${YELLOW}Paso 4: Iniciando los contenedores de la base de datos...${NC}"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Docker Compose falló al iniciar los contenedores.${NC}"
    exit 1
fi
echo -e "${GREEN}Base de datos y pgAdmin están corriendo en contenedores Docker.${NC}"

# --- Paso 5: Compilación de la Aplicación Node.js ---
echo -e "\n${YELLOW}Paso 5: Instalando dependencias y compilando la aplicación...${NC}"
echo "Instalando dependencias con npm (esto puede tardar)..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: 'npm install' falló. Revisa los errores de paquetes.${NC}"
    exit 1
fi

echo "Compilando el proyecto TypeScript a JavaScript..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: 'npm run build' falló. Revisa los errores de compilación de TypeScript.${NC}"
    exit 1
fi
echo -e "${GREEN}Aplicación compilada con éxito en la carpeta 'dist/'.${NC}"

# --- Paso 6: Obtención del Certificado SSL ---
echo -e "\n${YELLOW}Paso 6: Solicitando certificado SSL con Certbot...${NC}"
echo "Se podría requerir tu contraseña de 'sudo' para este paso."
# Aseguramos que el puerto 80 esté libre antes de que Certbot lo use.
sudo fuser -k 80/tcp || true
# Ejecutamos Certbot en modo 'standalone' para que cree su propio servidor web temporal.
sudo certbot certonly --standalone -d "$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email --force-renewal
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: La obtención del certificado SSL falló.${NC}"
    echo "Asegúrate de que el dominio '$DOMAIN' apunta a la IP de este servidor y el puerto 80 está abierto."
    exit 1
fi
echo -e "${GREEN}Certificado SSL obtenido y guardado con éxito.${NC}"

# --- Paso 7: Inicio de la Aplicación con PM2 ---
echo -e "\n${YELLOW}Paso 7: Iniciando la aplicación con el gestor de procesos PM2...${NC}"
# Verificamos si PM2 está instalado, si no, lo instalamos.
if ! command -v pm2 &> /dev/null; then
    echo "PM2 no encontrado. Instalando PM2 globalmente..."
    sudo npm install -g pm2
fi
# Detenemos cualquier instancia anterior con el mismo nombre para evitar conflictos.
pm2 delete "$APP_NAME" || true
# Iniciamos la aplicación desde la carpeta 'dist/' compilada.
# pm2 start dist/main.js --name "$APP_NAME"
NODE_ENV=develop pm2 start dist/main.js --name "$APP_NAME"

# Guardamos la lista de procesos para que PM2 los reinicie automáticamente tras un reinicio del servidor.
pm2 save
# Generamos el script de inicio para el sistema operativo. Puede que necesites ejecutar el comando que te muestre.
pm2 startup
echo -e "${GREEN}Aplicación '$APP_NAME' iniciada y gestionada por PM2.${NC}"

# --- Paso 8: Resumen Final ---
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}           ¡DESPLIEGUE FINALIZADO!           ${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Tu aplicación está disponible en: ${GREEN}https://$DOMAIN${NC}"
echo -e "Recuerda: El acceso es solo por HTTPS. No hay redirección desde HTTP."
echo -e "\nAdministrador de Base de Datos (pgAdmin):"
echo -e "  URL: http://<IP_DEL_SERVIDOR>:5050"
echo -e "  Usuario: ${YELLOW}$EMAIL${NC}"
echo -e "  Contraseña: ${YELLOW}change-this-password-123${NC}"
echo -e "\nComandos útiles:"
echo -e "  Ver logs de la aplicación: ${YELLOW}pm2 logs $APP_NAME${NC}"
echo -e "  Ver logs de la base de datos: ${YELLOW}docker-compose logs -f db${NC}"
echo -e "  Detener la aplicación: ${YELLOW}pm2 stop $APP_NAME${NC}"
echo -e "  Detener la base de datos: ${YELLOW}docker-compose down${NC}"

exit 0



jncourier.com
nikelijhonatan@gmail.com
CNAME www www.jncourier.com.cdn.hstgr.net
alias @ jncourier.com.cdn.hstgr.net

git fetch origin main
git reset --hard FETCH_HEAD
npm run start:dev


cd /home/ubuntu/projectos/courier/backend
git fetch origin main
git reset --hard FETCH_HEAD
pm2 restart all

1640700253

603110926

anyshared 1 640 700 253
Cómo Verificar que la Renovación Automática está Configurada:
sudo certbot renew --dry-run

sudo systemctl list-timers | grep 'certbot'
Deberías ver una salida similar a esta:
NEXT                        LEFT          LAST                        PASSED        UNIT                         ACTIVATES
Wed 2024-06-12 14:00:00 UTC 12h left      Tue 2024-06-11 14:00:00 UTC 12h ago       snap.certbot.renew.timer     snap.certbot.renew.service

Verifica que la configuración existe:
sudo ls -l /etc/letsencrypt/renewal/
Deberías ver el archivo app.jncourier.com.conf.


Verificar el Volumen del Contenedor:
Inspecciona el contenedor de la base de datos para ver sus "montajes" (volúmenes).

# El nombre del contenedor es 'courier_db' según tu archivo
docker inspect courier_db | grep -A 5 "Mounts"
Salida Correcta (Ejemplo):

"Mounts": [
    {
        "Type": "volume",
        "Name": "backend_postgres-data", // El nombre puede tener un prefijo
        "Source": "/var/lib/docker/volumes/backend_postgres-data/_data",
        "Destination": "/var/lib/postgresql/data",
        "Driver": "local",
        "Mode": "z",
        "RW": true,
        "Propagation": ""
    },
    // ... puede haber otros montajes como el de init.sql
],
Listar todos los Volúmenes de Docker:
Verifica que el volumen nombrado postgres-data existe en el sistema.
docker volume ls