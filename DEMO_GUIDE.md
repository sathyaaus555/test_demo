# Live Demo Guide

## Run the application

```bash
npm start
```

Open http://localhost:3000.

## Conference flow

1. Submit a valid student: Maya Chen, maya@example.com, Software Engineering.
2. Ask: "So, are we finished? Type YES or NO in the chat."
3. Submit the form with empty fields: the API returns HTTP 400.
4. Enter an invalid email: the API returns HTTP 400.
5. Register maya@example.com again: the API returns HTTP 409.
6. Run `npm test` to show repeatable automated verification.

## Small live AI-assisted change

Ask AI to add a new course option, such as "Artificial Intelligence," to `public/index.html`. Save, refresh, and show how quickly the visible feature appears. Then ask what else must be tested.

## Key message

AI helps us create code quickly. Engineering gives us confidence that people can trust it.
