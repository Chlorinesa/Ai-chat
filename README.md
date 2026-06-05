# AI Chat Application

Веб–приложение для общения с искусственным интеллектом через текстовый чат с использованием локальной модели LM Studio.

## Возможности

– Регистрация и авторизация пользователей (JWT)                                                                         
– Создание, удаление и переключение между чатами                                                                         
– Отправка сообщений AI с потоковым ответом (эффект печати)                                                                         
– Поиск чатов по названию                                                                         
– Автоматическое переименование чата AI после 4 сообщений                                                                         
– Копирование текста сообщения в буфер обмена                                                                         
– Отмена генерации ответа                                                                         
– Светлая/темная тема интерфейса                                                                         

## Технологии

Frontend: React 18, Vite, Ant Design, React Markdown

Backend: PHP 8, PostgreSQL, JWT, BCrypt

AI: LM Studio

## Установка и запуск

### Предварительные требования

– Node.js 16+ и npm
– PHP 8.0+
– PostgreSQL 13+
– Composer
– Open Server Panel
– LM Studio

### 1. Клонирование репозитория

```
git clone https://github.com/Chlorinesa/Ai–chat.git
cd Ai–chat
```

### 2. Настройка базы данных

Создайте базу данных в PostgreSQL:

```
CREATE DATABASE chat_db;
```

Выполните скрипт создания таблиц:

```
psql –U postgres –d chat_db –f backend/database/script.sql
```

### 3. Настройка бэкенда

```
cd backend
cp .env.example .env
```

Отредактируйте файл .env:

```
DB_HOST=localhost
DB_NAME=chat_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your–secret–key–change–it
```

Установите зависимости:

```
composer install
```

### 4. Настройка фронтенда

```
cd ../frontend
npm install
```

### 5. Запуск LM Studio

1. Скачайте и установите LM Studio
2. Загрузите модель (рекомендуется gemma–3)
3. Запустите локальный сервер на порту 1234

### 6. Запуск приложения

Бэкенд (Open Server Panel):
– Запустите Apache и PostgreSQL
– Настройте домен на папку backend

Фронтенд:

```
npm run dev
```

Приложение доступно: http://localhost:5173

Сборка для продакшена:

```
npm run build
```

Файлы из frontend/dist скопируйте в backend/public

## Настройка подключения к бэкенду

Если бэкенд работает не на http://chat–backend.local, отредактируйте frontend/src/constants/api.js:

```
export const API_BASE_URL = 'http://ваш–домен.local';
```

## Структура БД

– users – пользователи (id, username, password_hash, created_at)
– chats – чаты (id, user_id, title, created_at, updated_at)
– messages – сообщения (id, chat_id, role, content, created_at)

## API Endpoints

– POST /auth/register – Регистрация                                                                          
– POST /auth/login – Авторизация                                                                         
– GET /chats – Список чатов                                                                         
– POST /chats – Создание чата                                                                         
– DELETE /chats/{id} – Удаление чата                                                                         
– GET /chats/{id}/messages – История сообщений                                                                         
– POST /chats/{id}/messages/stream – Отправка сообщения (SSE)                                                                         

## Устранение неполадок

Ошибка подключения к БД: проверьте, запущен ли PostgreSQL и правильность данных в .env                                                                         
 Ошибка "AI service unavailable": убедитесь, что LM Studio запущен на порту 1234 и модель загружена                                                                         
 Ошибка 401 Unauthorized: JWT–токен истек, выполните повторный вход                                                                         

## Поддерживаемые браузеры

– Google Chrome 70+                                                                         
– Microsoft Edge 79+                                                                         
– Safari 14+                                                                         

## Контакты

 Репозиторий: https://github.com/Chlorinesa/Ai–chat                                                                         
 Email: marinasibirkina36639@gmail.com                                                                         

