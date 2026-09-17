# Live Demo Guide

## Run the application

```bash
npm install
npm start
```

Open <http://localhost:3000> and sign in with `demo` / `demo123`.

## Suggested conference flow

1. Show the two fictional accounts: ACC001 ($1,000) and ACC002 ($500).
2. Transfer $250 from ACC001 to ACC002 and show the successful message and $750 balances.
3. Try $0 to demonstrate amount validation.
4. Try more than the available balance to demonstrate insufficient-funds validation.
5. Select the same account twice to demonstrate account validation.
6. Run `npm test` to show repeatable automated verification.

## Key message

AI helps us create code quickly. Engineering and testing give us confidence that people can trust it.
