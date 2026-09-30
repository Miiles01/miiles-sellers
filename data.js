/*
 * Contenido del portal de vendedores.
 * Edita solo este archivo para cambiar servicios, precios, comisiones y textos.
 * - precio y comision: números en pesos (MXN), sin IVA.
 * - periodo: null (pago único) o 'mes' (mensualidad).
 */
window.SELLERS = {
  pin: '6464',
  iva: 0.16,

  categorias: [
    { id: 'genericos', nombre: 'Genéricos', descripcion: 'Para cualquier tipo de negocio' },
    { id: 'clinicas', nombre: 'Clínicas', descripcion: 'Nicho especializado' },
  ],

  servicios: [
    {
      id: 'marca-agente',
      categoria: 'genericos',
      nombre: 'Creación de Marca + Agente Diseñador IA',
      icono: 'assets/flor-azul.svg',
      descripcion: 'Identidad de marca completa + un agente de IA personalizado que trabaja 24/7 generando diseños para redes sociales con la línea gráfica de la marca.',
      precio: 2000,
      periodo: null,
      comision: 1000,
      comisionNota: '50% del precio',
      incluye: [
        'Diseño de identidad de marca completo',
        'Agente de IA configurado con la línea gráfica de la marca',
        'Diseños para redes sociales generados 24/7',
      ],
    },
    {
      id: 'embudo-agente',
      categoria: 'genericos',
      nombre: 'Embudo Comercial + Agente IA',
      icono: 'assets/flecha-azul.svg',
      descripcion: 'Infraestructura digital (sitio web, catálogo o página de aterrizaje) + un agente de IA que construye activos y automatizaciones para convertir el tráfico de redes e internet en clientes.',
      precio: 2000,
      periodo: null,
      comision: 1000,
      comisionNota: '50% del precio',
      incluye: [
        'Sitio web, catálogo o página de aterrizaje',
        'Agente o sistema de IA para crear activos digitales',
        'Automatizaciones para capturar tráfico de redes sociales e internet',
      ],
    },
    {
      id: 'clinicas-agenda',
      categoria: 'clinicas',
      nombre: 'Automatización y Agendamiento para Consultorios',
      icono: 'assets/estrella-azul.svg',
      descripcion: 'Portal web y sistema automatizado para que los pacientes agenden solos, 24/7.',
      precio: 500,
      periodo: 'mes',
      comision: 500,
      comisionNota: '100% del primer mes',
      clienteIdeal: 'Micro-clínicas o consultorios de 1 a 2 personas: médicos independientes o con un solo asistente.',
      dolor: 'Agenda desorganizada, sin tiempo en consulta para contestar mensajes y pacientes perdidos por no responder a tiempo.',
      incluye: [
        'Portal web del consultorio',
        'Agenda automática: el paciente reserva solo, 24/7',
      ],
    },
  ],

  comisiones: [
    { titulo: 'Cómo se calcula', texto: 'Un monto fijo por venta cerrada: $1,000 en servicios genéricos y el primer mes completo ($500) en Clínicas. El IVA no cambia tu comisión.' },
    { titulo: 'Cuándo se paga', texto: null },
    { titulo: 'Qué cuenta como venta', texto: null },
  ],

  proceso: [
    { titulo: 'Detecta el dolor', texto: '¿Se ve genérico, no convierte sus redes en clientes o pierde pacientes por no contestar? Escucha primero y ubica el servicio.' },
    { titulo: 'Comparte el resumen', texto: 'Copia el resumen del servicio desde este portal y mándalo por WhatsApp. Ya incluye precio e IVA.' },
    { titulo: 'Aclara la factura', texto: 'Los precios son netos. Si el cliente pide factura, se suma 16% de IVA.' },
    { titulo: 'Cierra y avisa', texto: 'Cuando el cliente pague, avisa al equipo para registrar la venta a tu nombre.' },
  ],

  objeciones: [
    {
      pregunta: '"Está muy caro"',
      respuesta: 'Compáralo: una marca completa más un agente que diseña todos los días cuesta $2,000 una sola vez, menos que un mes de un diseñador. En clínicas son $500 al mes, menos que un paciente perdido.',
    },
    {
      pregunta: '"Ya tengo diseñador" o "ya tengo página"',
      respuesta: 'El agente de IA no reemplaza a nadie: produce todos los días con su línea gráfica y deja libre a su equipo para lo importante. Si su página no le trae clientes, el embudo es justo lo que le falta.',
    },
    {
      pregunta: '"No sé usar inteligencia artificial"',
      respuesta: 'No tiene que saber: lo dejamos configurado y trabaja solo. El cliente solo revisa y publica.',
    },
    {
      pregunta: '"Mis pacientes prefieren llamar"',
      respuesta: 'Pueden seguir llamando. El sistema atiende a los que escriben fuera de horario o mientras el médico está en consulta, que son los que hoy se pierden.',
    },
    {
      pregunta: '"Lo voy a pensar"',
      respuesta: 'Pregunta qué le hace dudar y responde eso. En clínicas, recuérdale que el pago es mensual: arranca con $500 y ve resultados desde el primer mes.',
    },
  ],
};
