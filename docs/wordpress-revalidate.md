# Purga del caché desde WordPress

El sitio cachea las respuestas de la API REST de WordPress. Para que una
publicación se vea igual de rápido que antes, WordPress tiene que avisar a
Next.js cuando algo cambia. Eso lo hace este mu-plugin.

Sin él el sitio sigue funcionando, pero el contenido nuevo tarda hasta
10 minutos en aparecer (la ventana de respaldo de `FALLBACK_REVALIDATE`).
Con él aparece en 1-2 segundos.

## 1. Generar el secreto

```bash
openssl rand -hex 32
```

Ese valor va en dos sitios, y tiene que ser idéntico en ambos:

- **Vercel** → Project Settings → Environment Variables → `WP_REVALIDATE_SECRET`
- **WordPress** → en el archivo del paso 2

Después de añadirlo en Vercel hay que volver a desplegar para que el runtime
lo vea.

## 2. Instalar el mu-plugin

Crear el archivo `wp-content/mu-plugins/columbia-revalidate.php`. La carpeta
`mu-plugins` puede no existir todavía; se crea y ya está (los *must-use
plugins* se activan solos, no hay que tocar nada en el panel).

```php
<?php
/**
 * Avisa a Next.js cuando cambia un post, para que purgue su caché.
 *
 * Instalar en: wp-content/mu-plugins/columbia-revalidate.php
 */

const COLUMBIA_REVALIDATE_URL    = 'https://columbia.co.cr/api/revalidate';
const COLUMBIA_REVALIDATE_SECRET = 'PEGAR_AQUI_EL_MISMO_VALOR_QUE_EN_VERCEL';

function columbia_ping_next( $post_id, $post ) {
    // Los autoguardados y revisiones no cambian lo que ve el público.
    if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
        return;
    }

    if ( ! $post instanceof WP_Post || 'post' !== $post->post_type ) {
        return;
    }

    // Editar un borrador tampoco cambia nada público. Solo nos interesa
    // cuando el post está publicado, o cuando acaba de dejar de estarlo.
    if ( 'publish' !== $post->post_status && 'trash' !== $post->post_status ) {
        return;
    }

    wp_remote_post(
        COLUMBIA_REVALIDATE_URL,
        array(
            'timeout'  => 5,
            // Sin blocking el editor no espera la respuesta: publicar sigue
            // sintiéndose instantáneo aunque la red vaya lenta.
            'blocking' => false,
            'headers'  => array(
                'Content-Type'      => 'application/json',
                'X-Columbia-Secret' => COLUMBIA_REVALIDATE_SECRET,
            ),
            'body'     => wp_json_encode(
                array(
                    'slug'   => $post->post_name,
                    'status' => $post->post_status,
                )
            ),
        )
    );
}

add_action( 'save_post', 'columbia_ping_next', 10, 2 );

// Cubre publicar, despublicar y mandar a la papelera.
add_action(
    'transition_post_status',
    function ( $new_status, $old_status, $post ) {
        if ( $new_status === $old_status ) {
            return;
        }
        if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
            return;
        }
        columbia_ping_next( $post->ID, $post );
    },
    10,
    3
);

// Borrado definitivo: hay que purgar antes de que el post desaparezca.
add_action(
    'before_delete_post',
    function ( $post_id ) {
        $post = get_post( $post_id );
        if ( $post ) {
            columbia_ping_next( $post_id, $post );
        }
    }
);
```

## 3. Comprobar que funciona

Primero, que la ruta esté desplegada y vea el secreto:

```bash
curl -s https://columbia.co.cr/api/revalidate
# {"ok":true,"method":"POST","secretConfigured":true}
```

Si `secretConfigured` es `false`, falta la variable en Vercel o falta
redesplegar.

Luego, que el secreto coincida:

```bash
curl -s -X POST https://columbia.co.cr/api/revalidate \
  -H 'Content-Type: application/json' \
  -H 'X-Columbia-Secret: EL_SECRETO' \
  -d '{"slug":"cualquier-slug-real"}'
# {"ok":true,"revalidated":"cualquier-slug-real","at":"..."}
```

Un `401` significa que el secreto no coincide con el de Vercel.

Por último, la prueba de verdad: publicar un post de prueba y recargar la
portada. Debería aparecer enseguida, no al cabo de unos minutos.

## Qué pasa si el webhook falla

Nada grave, y es a propósito: cada petición cacheada tiene una ventana de
respaldo de 10 minutos (`FALLBACK_REVALIDATE` en `src/lib/wordpressService.ts`).
Si se pierde un aviso, el contenido queda como mucho 10 minutos
desactualizado. Nunca se rompe ni se queda indefinidamente viejo.
