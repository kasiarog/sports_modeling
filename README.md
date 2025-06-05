Run index.ts

```
 ts-node src/index.ts
 ts-node src/index_soccer.ts
 ts-node src/index_badminton.ts
 ts-node src/index_tennis.ts
```

Pomysły na wzorce projektowe:

- Factory odpowiada za tworzenie instancji zdarzeń w jednolity sposób, co ułatwia zarządzanie ich tworzeniem i pozwala na dostowowywanie logiki inicjalizacji. w naszym przypadku odpowiada za dodanie observatorów w momencie tworzenia zdarzenia, co pozwala na automatyczne dodawanie ich do listy obserwatorów. Dzięki temu nie trzeba ręcznie dodawać obserwatorów do zdarzenia po jego utworzeniu, co ułatwia zarządzanie kodem i zmniejsza ryzyko błędów.

- Observer odpowiada za powiadamianie i reagowanie na zmiany w stanie zdarzenia - czyli informuje różne zainteresowane elementy systemu o aktualizacji wyniku czy wystąpieniu nowego zdarzenia.

- State odpowiada za zmianę fazy podczas odbywania się turnieju, turniej inicjowane jest z konkretna faza w ramach ktorej odbywaja się mecze, kiedy wszystkie zaplanowane mecze w fazie się odbędą a logika uzna fazę za zakończoną turniej automatycznie przechodzi do następnej fazy

- Strategy opdowiada za dostarczenie logiki na podstawie której odbywa się mecz, każdy sport ma swoją unikalną logikę na podstawie, której odbywają się mecze, są przyznawane punkty, wyłaniany jest zwycięzca oraz kończy się mecz. Strategia jest dostarczana przy inicjacji turnieju, aby mógł przybrać on formę odpowiednią dla sportu

- Singleton odpowiada za upewnienie się, że w ramach działania programu odbywa się tylko jeden turniej, ponieważ nasz program dla maksymalizacji zysków sprzedaży jest konfigurowany tylko pod jeden sport na jego kopię na kupującego
