import Swal from 'sweetalert2'

/**
 * Servicio centralizado de alertas.
 * Reemplaza alert() y confirm() nativos del navegador
 * con diálogos modernos, compactos y estilizados.
 */

/* ── Inyectar estilos compactos una sola vez ── */
if (!document.getElementById('swal-compact-styles')) {
  const style = document.createElement('style')
  style.id = 'swal-compact-styles'
  style.textContent = `
    .swal-compact-popup {
      width: 340px !important;
      padding: 1.25rem 1.25rem 1rem !important;
      border-radius: 1rem !important;
      font-family: 'Inter', system-ui, sans-serif !important;
    }
    .swal-compact-popup .swal2-icon {
      transform: scale(0.7) !important;
      margin: -0.5rem auto 0 !important;
    }
    .swal-compact-title {
      font-size: 1.05rem !important;
      font-weight: 700 !important;
      padding: 0 !important;
      margin: 0 0 0.25rem !important;
    }
    .swal-compact-html {
      font-size: 0.85rem !important;
      line-height: 1.4 !important;
      margin: 0 !important;
      padding: 0.25rem 0.5rem !important;
      color: #6b7280 !important;
    }
    .swal-compact-actions {
      margin-top: 0.75rem !important;
      padding: 0 !important;
      gap: 0.5rem !important;
    }
    .swal-compact-confirm,
    .swal-compact-cancel {
      font-size: 0.8rem !important;
      font-weight: 600 !important;
      padding: 0.45rem 1.1rem !important;
      border-radius: 0.5rem !important;
    }
  `
  document.head.appendChild(style)
}

const baseStyles = {
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'swal-compact-popup',
    title: 'swal-compact-title',
    htmlContainer: 'swal-compact-html',
    actions: 'swal-compact-actions',
    confirmButton: 'swal-compact-confirm',
    cancelButton: 'swal-compact-cancel',
  },
  buttonsStyling: true,
  reverseButtons: true,
}

const alerts = {
  /**
   * Muestra un mensaje de éxito
   */
  success(message, title = '¡Listo!') {
    return Swal.fire({
      ...baseStyles,
      icon: 'success',
      title,
      text: message,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    })
  },

  /**
   * Muestra un mensaje de error
   */
  error(message, title = 'Error') {
    return Swal.fire({
      ...baseStyles,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Entendido',
    })
  },

  /**
   * Muestra un mensaje de advertencia
   */
  warning(message, title = 'Advertencia') {
    return Swal.fire({
      ...baseStyles,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Entendido',
    })
  },

  /**
   * Muestra un mensaje informativo
   */
  info(message, title = 'Información') {
    return Swal.fire({
      ...baseStyles,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'OK',
    })
  },

  /**
   * Diálogo de confirmación (reemplaza confirm())
   * Devuelve true si el usuario confirma, false si cancela.
   */
  async confirm(message, title = '¿Estás seguro?', confirmText = 'Sí, continuar', cancelText = 'Cancelar') {
    const result = await Swal.fire({
      ...baseStyles,
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    })
    return result.isConfirmed
  },

  /**
   * Confirmación de eliminación (estilo peligroso)
   */
  async confirmDelete(message = '¿Estás seguro de eliminar este elemento?', title = '¿Eliminar?') {
    const result = await Swal.fire({
      ...baseStyles,
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    return result.isConfirmed
  },

  /**
   * Toast (notificación pequeña en la esquina)
   */
  toast(message, icon = 'success') {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    })
  },
}

export default alerts
