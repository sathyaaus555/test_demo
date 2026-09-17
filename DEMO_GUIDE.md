# Live Demo Guide

## Run the application

```bash
npm install
npm start
```

Open <http://localhost:3000> and sign in with `demo` / `demo123`.

## Suggested presentation flow

1. Show ACC001 ($1,000) and the beneficiary account PAY001 ($500).
2. Transfer $250 from ACC001 to PAY001 and show the successful message and updated balances.
3. Try $0 to demonstrate amount validation.
4. Try more than the available balance to demonstrate insufficient-funds validation.
5. Select the same account twice to demonstrate account validation.
6. Run `npm test` to show repeatable automated verification.
7. Transfer $1,500 from ACC001 to PAY001. The application incorrectly allows it.
8. Run `npm test`. The insufficient-funds test fails and exposes the missing validation.

## Key message

AI helps us create code quickly, but speed does not guarantee accuracy. The failing test shows how automated verification catches a business-rule defect before customers are affected.
