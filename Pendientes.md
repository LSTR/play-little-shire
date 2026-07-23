# Pendientes — Hanna in Middle Earth

Backlog de ideas propuestas y aprobadas para conversar, pero **todavía no implementadas**.
Cuando se retome el proyecto en una sesión nueva, revisar esta lista antes de asumir que no
queda nada por hacer.

## Juegos cooperativos propuestos (2026-07-16) — ✅ los 6 implementados

Todos los juegos multijugador (Memoria, Acertijos, El Gran Viaje, El Dragón Despierta,
Tira y Afloja, Carrera de Barriles, Segundo Desayuno) más los 6 cooperativos propuestos el
2026-07-16 ya están implementados, incluido el modo **Equipo** de El Gran Viaje (cooperativo,
contra el humo de Smaug). Se hicieron uno por uno, en orden de esfuerzo acordado 2026-07-19,
presentando el plan de cada uno antes de escribir código (ver detalle de cada uno abajo). Si se
retoma el proyecto y se quieren más juegos, este es el patrón a seguir: proponer ideas, acordar
orden, plan compacto + build en el mismo turno, verificar con capturas, `npm run build`, y
marcar aquí.

1. ✅ **Escapar del Trol dormido** — IMPLEMENTADO 2026-07-19 como "El Trol Dormido"
   (`src/games/sneak/SneakScene.js`, escena `Sneak`). Cooperativo por sincronía: cuando el
   trol entra en sueño profundo (aro verde brillante), ambos deben tocar dentro de una ventana
   de ~1,2 s (anillo dorado que se encoge en el botón del compañero). Tocar a destiempo solo
   hace gruñir al trol (sin castigo). 5 gemas robadas = victoria de equipo. Deep-links dev:
   `?scene=Sneak&wait=ms&safe=ms&sync=ms&gems=N`.

2. ✅ **Barril compartido** — IMPLEMENTADO 2026-07-22 (`src/games/sharedbarrel/SharedBarrelScene.js`,
   escena `SharedBarrel`). Un solo barril, dos ejes independientes: el jugador 1 controla el
   carril (izquierda/derecha) para esquivar rocas que caen río abajo; el jugador 2 controla la
   fila (cerca/lejos) para esquivar troncos que cruzan la corriente de lado a lado. Ningún
   peligro depende del eje del otro jugador, así que cada quien vigila y avisa el suyo — ahí
   está la cooperación. Golpe = tropezón breve (sin castigo ni fin de partida), barra de
   progreso compartida hasta la meta. Arte nuevo: `obstacle-log`. Deep-links dev:
   `?scene=SharedBarrel&finish=N&speed=N&hazard=rock|log|both&lane=0-2&row=0-2`.

3. ✅ **El Faro de Gondor** — IMPLEMENTADO 2026-07-22 (`src/games/beacons/BeaconsScene.js`,
   escena `Beacons`). Inspirado en la escena de encender los faros en El Retorno del Rey: seis
   hogueras en zigzag (3 por jugador, de cerca a lejos), la señal salta de una a la otra en
   orden — jugador 1, jugador 2, jugador 1... Cuando le toca a una hoguera, una chispa vuela
   hasta ella y aparece un anillo dorado que se encoge (~2,2 s) para tocarla a tiempo. Ajuste
   respecto a la idea original: en vez de reiniciar toda la cadena si alguien tarda, esa misma
   hoguera simplemente vuelve a intentarlo (parpadea y se regenera el anillo) — sin perder
   progreso, siguiendo la regla del proyecto de nada de fail states duros. Las 6 encendidas =
   victoria de equipo, la señal sigue volando hacia el horizonte. Arte nuevo: `beacon-unlit` /
   `beacon-lit`. Deep-links dev: `?scene=Beacons&window=ms&beacon=0-5`.

4. ✅ **El Árbol de los Secretos** — IMPLEMENTADO 2026-07-22 (`src/games/secrettree/SecretTreeScene.js`,
   escena `SecretTree`). Memoria cooperativa estilo Codenames: pantalla dividida, uno frente al
   otro (mitad de abajo normal, mitad de arriba rotada 180°, mismo patrón de Tira y Afloja /
   El Dragón Despierta). Cada quien ve 6 símbolos, uno de cada pareja — el otro tiene la pareja
   en su propia mitad, en otra posición. Se describen en voz alta lo que ven y tocan el símbolo
   que creen que hace pareja; si aciertan, se encienden y desaparecen; si no, meneo simpático y
   a intentar de nuevo (sin castigo, sin reloj). 6 parejas = victoria de equipo. Requiere que ya
   sepan hablar bien — pensado para niños un poco mayores. Reutiliza el arte/tokens de Memoria,
   sin arte nuevo. Deep-links dev: `?scene=SecretTree&pairs=3-8&fixed=1&found=N`.

5. ✅ **Defender la Comarca** — IMPLEMENTADO 2026-07-19 (`src/games/shire/ShireScene.js`,
   escena `Shire`). Tiempo real, ambos a la vez: arañas (1 toque) y trolls (2 toques, el
   primero los empuja) convergen hacia la puerta redonda desde ambos lados; cada jugador
   defiende su mitad (línea punteada) y comparten 5 corazones. Resistir ~60 s hasta que el sol
   llegue al final de la barra = amanecer y victoria de equipo. Derrota = panel amable de
   reintentar (sin pantalla de perdedor). Arte nuevo: `heart`. Deep-links dev:
   `?scene=Shire&run=ms&spawn=ms&speed=n&lane=y&hearts=N`.

6. ✅ **El Tesoro de Erebor** — IMPLEMENTADO 2026-07-19 (`src/games/treasure/TreasureScene.js`,
   escena `Treasure`). Cooperativo tranquilo por turnos, sin reloj: el cofre pide un tesoro a la
   vez (silueta que pulsa) y el jugador de turno toca el tesoro correcto entre los desperdigados
   por el suelo. Error = meneo simpático, sin castigo. 6 tesoros = el cofre se cierra, victoria
   de equipo. Arte nuevo: `chest-open` / `chest-closed`. Deep-links dev:
   `?scene=Treasure&fixed=1&filled=N`.

## Otras ideas implementadas (fuera del backlog original)

- ✅ **El Sendero de la Comarca** — IMPLEMENTADO 2026-07-22 (`src/games/clearing/ClearingScene.js`,
  escena `Clearing`). Primer juego de movimiento libre del catálogo (los demás son de toques o
  turnos): joystick virtual fijo abajo a la izquierda, un jugador camina desde abajo hasta la
  puerta arriba. Arañas dispersas en el camino (mismo arte que Defender la Comarca) — se pueden
  tocar para espantarlas o simplemente rodearlas caminando, nunca bloquean el paso. Sin reloj,
  sin derrota posible. Movimiento y colisión hechos a mano (el juego no usa el motor de físicas
  de Phaser, que no está activado globalmente). Cero arte nuevo. Deep-links dev:
  `?scene=Clearing&spiders=N`. Si se quiere explorar más este género (mapas más grandes con
  scroll de cámara, enemigos que persiguen, modo cooperativo), este es el punto de partida.

## Otras tareas pendientes

- **Pase de pulido**: ícono de la app, pantalla de splash para Android, música de fondo
  (actualmente los sonidos son sintetizados, no hay música).
- **Probar en dispositivo real**: `npm run android` para sentir el catálogo completo en un
  teléfono (hasta ahora todo se verificó en Chrome/headless).
- **appId de Android**: `capacitor.config.json` sigue con `app.littlemiddleearth` como
  identificador interno del paquete Android (no visible para el usuario). El nombre visible ya
  se cambió a "Hanna in Middle Earth". Si se quiere cambiar también el appId, hay que hacerlo
  antes de publicar en Play Store (después de publicar, cambiarlo rompe las actualizaciones).
