/*
 * Contenido del portal de vendedores.
 * Edita solo este archivo para cambiar productos, precios, comisiones y textos.
 * - precio: número en pesos (MXN) o null → se muestra "Por definir".
 * - comision: porcentaje (10 = 10%) o null → se muestra "Por definir".
 */
window.SELLERS = {
  pin: '6464',

  // Dominio donde viven los briefs que el vendedor comparte con el cliente.
  sitio: 'https://wearemiiles.com',

  productos: [
    {
      id: 'branding',
      nombre: 'Identidad de marca',
      icono: 'assets/flor-azul.svg',
      resumen: 'Define a quién le habla la marca, qué problema resuelve y cómo diferenciarse de forma consistente en diseño, comunicación y estrategia.',
      precio: null,
      comision: null,
      entrega: null,
      idealPara: 'Marcas nuevas o que ya venden pero se ven genéricas y necesitan diferenciarse.',
      incluye: [
        'Estrategia de marca: público, propuesta de valor y diferenciador',
        'Logotipo y sistema visual',
        'Paleta de color y tipografías',
        'Tono de voz y mensajes clave',
      ],
      brief: '/brief/branding',
    },
    {
      id: 'web',
      nombre: 'Diseño Web & Digital',
      icono: 'assets/flecha-azul.svg',
      resumen: 'Landing pages de alto impacto, plataformas web y experiencias interactivas optimizadas para convertir visitas en clientes.',
      precio: null,
      comision: null,
      entrega: null,
      idealPara: 'Negocios que necesitan vender en línea o que tienen un sitio que no convierte.',
      incluye: [
        'Estructura y textos pensados para vender',
        'Diseño responsivo para celular, tablet y escritorio',
        'Animaciones y microinteracciones',
        'Publicación en su dominio',
      ],
      brief: '/brief/web-design',
    },
    {
      id: 'contenido',
      nombre: 'Estrategia & Contenido',
      icono: 'assets/miiles-azul.svg',
      resumen: 'Campañas visuales, assets publicitarios y contenido que impulsa el crecimiento de la marca en redes.',
      precio: null,
      comision: null,
      entrega: null,
      idealPara: 'Marcas con identidad definida que necesitan publicar constante y con intención.',
      incluye: [
        'Estrategia de contenido por objetivos',
        'Diseño de publicaciones y campañas',
        'Assets para anuncios',
        'Calendario de publicación',
      ],
      brief: '/brief/growth',
    },
  ],

  comisiones: [
    { titulo: 'Cómo se calcula', texto: null },
    { titulo: 'Cuándo se paga', texto: null },
    { titulo: 'Qué cuenta como venta', texto: null },
  ],

  beneficios: [
    {
      icono: 'assets/miiles-azul.svg',
      titulo: 'Todo en un solo equipo',
      texto: 'Marca, web y contenido con el mismo equipo creativo. El cliente no tiene que coordinar a tres proveedores.',
    },
    {
      icono: 'assets/estrella-azul.svg',
      titulo: 'Brief interactivo en 4 minutos',
      texto: 'El cliente responde un brief guiado desde su celular. Sin llamadas largas para arrancar.',
    },
    {
      icono: 'assets/flor-azul.svg',
      titulo: 'Propuesta personalizada',
      texto: 'Con el brief, Miiles diseña una propuesta visual y estratégica hecha para los objetivos del cliente.',
    },
    {
      icono: 'assets/sonrisa-azul.svg',
      titulo: 'Portafolio que respalda',
      texto: 'Proyectos reales en wearemiiles.com/trabajo para que el cliente vea el nivel antes de decidir.',
    },
  ],

  proceso: [
    { titulo: 'Detecta la necesidad', texto: '¿Le falta marca, un sitio que venda o contenido constante? Escucha primero y ubica el producto.' },
    { titulo: 'Comparte el brief', texto: 'Copia el link del brief del producto y envíaselo al cliente. Le toma unos 4 minutos.' },
    { titulo: 'Miiles prepara la propuesta', texto: 'El equipo revisa el brief y arma una propuesta visual y estratégica personalizada.' },
    { titulo: 'Cierra y avisa', texto: 'Cuando el cliente acepte, avisa al equipo para registrar la venta a tu nombre.' },
  ],

  objeciones: [
    {
      pregunta: '"Está muy caro"',
      respuesta: 'Regresa al problema: ¿cuánto le cuesta hoy verse genérico o tener un sitio que no vende? Muestra el portafolio y explica que es una inversión que se usa por años.',
    },
    {
      pregunta: '"Ya tengo diseñador"',
      respuesta: 'Miiles no reemplaza a nadie: da estrategia, sistema de marca y ejecución en un solo equipo. Su diseñador puede trabajar después con el sistema que entreguemos.',
    },
    {
      pregunta: '"No tengo tiempo para esto"',
      respuesta: 'El brief toma 4 minutos desde el celular. Con eso el equipo arranca la propuesta sin juntas largas.',
    },
    {
      pregunta: '"Lo voy a pensar"',
      respuesta: 'Propón que llene el brief sin compromiso: recibe una propuesta personalizada y decide con algo concreto en la mano.',
    },
  ],

  recursos: [
    { titulo: 'Portafolio', texto: 'Proyectos reales para mostrar el nivel de Miiles.', ruta: '/trabajo' },
    { titulo: 'Catálogo de briefs', texto: 'La página donde el cliente elige qué brief llenar.', ruta: '/' },
  ],
};
