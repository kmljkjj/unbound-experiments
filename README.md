# Unbound Experiments

Plugin Unbound pour débloquer l’onglet **Experiments** (et réglages développeur associés) dans Discord mobile.

## Installation

1. Ouvre Discord → **Paramètres** → section **Unbound** → **Plugins**
2. Appuie sur **+**
3. Colle ce lien :

```
https://raw.githubusercontent.com/kmljkjj/unbound-experiments/main/manifest.json
```

4. **Install** puis active le switch du plugin
5. Redémarre Discord si l’onglet n’apparaît pas tout de suite

## Avertissement

Les Experiments sont des fonctionnalités non publiées. Elles peuvent :

- faire planter Discord
- casser l’interface
- se comporter de façon imprévisible

Utilise uniquement ce que tu comprends. En cas de souci : désactive le plugin, ou active **Recovery Mode** dans Unbound → General.

## Notes techniques

Discord change souvent ses modules internes (Metro). Ce plugin fait un patch « best effort » sur `isDeveloper` / user flags / stores d’experiments. Après une mise à jour Discord, il peut ne plus fonctionner et devoir être mis à jour.

## Licence

MIT — à tes risques et périls.
