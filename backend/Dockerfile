FROM node:18-alpine

WORKDIR /app

# Önce package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Modülleri yükle
RUN npm install

# Sonra diğer tüm dosyaları kopyala
COPY . .

# Uploads klasörlerini oluştur (eğer yoksa)
RUN mkdir -p uploads/dernek-logos uploads/faaliyet-images uploads/temp

# Upload klasörüne yazma izni ver
RUN chmod -R 755 uploads/

# Uygulamanın çalışacağı portu belirle
EXPOSE 3001

# Uygulamayı başlat
CMD ["npm", "start"]