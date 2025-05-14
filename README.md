Pomysły na wzorce projektowe:

- Factory odpowiada za tworzenie instancji zdarzeń w jednolity sposób, co ułatwia zarządzanie ich tworzeniem i pozwala na dostowowywanie logiki inicjalizacji (np. automatyczne dodawanie obserwatorów).

- Observer  odpowiada za powiadamianie i reagowanie na zmiany w stanie zdarzenia - czyli informuje różne zainteresowane elementy systemu o aktualizacji wyniku czy wystąpieniu nowego zdarzenia.


w przypadku tego Factory odpowiada za dodanie observatorów w momencie tworzenia zdarzenia, co pozwala na automatyczne dodawanie ich do listy obserwatorów. Dzięki temu nie trzeba ręcznie dodawać obserwatorów do zdarzenia po jego utworzeniu, co ułatwia zarządzanie kodem i zmniejsza ryzyko błędów.