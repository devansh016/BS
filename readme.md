# Bitespeed Task

## Features

- Identify a customer based on `email` and/or `phoneNumber`
- Consolidate contacts with a "primary" and "secondary" hierarchy
- Automatically create new contacts or link existing ones
- Returns a unified contact record in response

## Tech Stack

- Node.js
- Express.js
- MongoDB

## API Endpoint

### POST /identify

Request Body
```json
{
  "email": "email@example.com",
  "phoneNumber": "1234567890"
}
```

## Live Demo
Link: https://bitespeed-task-adka.onrender.com/
