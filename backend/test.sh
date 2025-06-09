Paso 1: Actualización del Sistema
Es una buena práctica asegurarse de que todos los paquetes del sistema estén actualizados antes de instalar nuevo software.

# Actualizar la lista de paquetes disponibles
sudo apt-get update

# Instalar las actualizaciones pendientes
sudo apt-get upgrade -y
Paso 2: Instalación de Docker y Docker Compose
Se utilizará el repositorio oficial de Docker para obtener la versión más reciente y estable.

# 1. Instalar paquetes de prerrequisitos para usar repositorios sobre HTTPS
sudo apt-get install -y ca-certificates curl gnupg

# 2. Añadir la clave GPG oficial de Docker al llavero del sistema
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Añadir el repositorio de Docker a las fuentes de APT
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Actualizar la lista de paquetes de nuevo para incluir los de Docker
sudo apt-get update

# 5. Instalar Docker Engine, la CLI y el plugin de Docker Compose
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Añadir tu usuario al grupo 'docker' para poder ejecutar comandos sin 'sudo'
sudo usermod -aG docker $USER

# ** IMPORTANTE **: Debes cerrar sesión y volver a iniciarla, o abrir una nueva terminal
# para que este cambio de grupo tenga efecto.

Paso 3: Instalación de Node.js v20
Se utilizará el repositorio de NodeSource, que es el método recomendado para instalar versiones específicas de Node.js.

# 1. Descargar y ejecutar el script de configuración de NodeSource para Node.js v20
# Este comando añade el repositorio de NodeSource a tu sistema.
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 2. Instalar Node.js (esto incluye npm)
sudo apt-get install -y nodejs

Paso 4: Instalación de PM2
PM2 es un gestor de procesos para aplicaciones Node.js. Se instala globalmente usando npm.

# Instalar PM2 globalmente con privilegios de superusuario
sudo npm install -g pm2

Paso 5: Instalación de Certbot
El método recomendado por Let's Encrypt para Ubuntu es a través de snap.

# 1. Instalar el gestor de paquetes snapd (normalmente ya está en Ubuntu 20.04)
sudo apt-get install -y snapd

# 2. Instalar el paquete de Certbot usando snap
sudo snap install --classic certbot

# 3. Crear un enlace simbólico para que el comando 'certbot' esté disponible globalmente
sudo ln -s /snap/bin/certbot /usr/bin/certbot


Paso 6: Verificación Final
Después de completar todos los pasos, ejecuta los siguientes comandos para verificar que cada componente se ha instalado correctamente. Deberías ver las versiones de cada herramienta.

# Verificar Docker (recuerda re-iniciar sesión antes)
docker --version

# Verificar Docker Compose
docker compose version

# Verificar Node.js
node -v

# Verificar npm
npm -v

# Verificar PM2
pm2 --version

# Verificar Certbot
certbot --version