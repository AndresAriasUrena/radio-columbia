# Actualización de Resultados de Lotería

Este archivo explica cómo actualizar los resultados de lotería que se muestran en el navbar del sitio.

## Archivo de Datos

Los resultados se encuentran en: `public/data/lottery-results.json`

## Cómo Actualizar

1. Visita [https://www.jps.go.cr/resultados](https://www.jps.go.cr/resultados)
2. Copia los números ganadores del último sorteo
3. Edita el archivo `lottery-results.json` con los nuevos datos
4. Haz commit y push de los cambios

## Formato del Archivo

```json
{
  "loteria": {
    "fecha": "Domingo, 30 de Noviembre",
    "sorteo": "4878",
    "vigencia": "29/1/2026",
    "premios": [
      {
        "rank": 1,
        "numero": "78",
        "serie": "720",
        "premio": "150000000"
      }
    ]
  },
  "chances": {
    "fecha": "Martes, 2 de Diciembre",
    "sorteo": "6996",
    "vigencia": "2/2/2026",
    "premios": [...]
  }
}
```

## Frecuencia de Sorteos

- **Lotería Nacional**: Domingos
- **Chances**: Martes y Viernes

## Notas

- El premio debe estar en colones sin comas (ej: "150000000" para ₡150,000,000)
- Las series y números deben ser strings
- Actualizar `lastUpdate` con la fecha/hora actual
