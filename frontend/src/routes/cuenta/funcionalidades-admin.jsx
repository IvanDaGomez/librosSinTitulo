import { useMemo } from "react"
export default function FuncionalidadesAdmin() {
  const options = useMemo(() => {
    return [
      {
        name: 'Gestionar Libros a Subir',
        href: '/protected/review',
        description: 'Revisa y aprueba libros pendientes de subida',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
        <path d="M11.5 3.00366C10.9383 3.01202 10.3789 3.03449 9.8294 3.07102C5.64639 3.34908 2.31441 6.72832 2.04024 10.9707C1.98659 11.8009 1.98659 12.6606 2.04024 13.4908C2.1401 15.0359 2.82343 16.4665 3.62791 17.6746C4.09501 18.5203 3.78674 19.5758 3.30021 20.4978C2.94941 21.1625 2.77401 21.4949 2.91484 21.735C3.05568 21.9752 3.37026 21.9828 3.99943 21.9981C5.24367 22.0284 6.08268 21.6757 6.74868 21.1846C7.1264 20.906 7.31527 20.7668 7.44544 20.7508C7.5756 20.7347 7.83177 20.8403 8.34401 21.0512C8.8044 21.2408 9.33896 21.3579 9.8294 21.3905C11.2536 21.4851 12.7435 21.4853 14.1706 21.3905C18.3536 21.1124 21.6856 17.7332 21.9598 13.4908C22.0134 12.6606 22.0134 11.8009 21.9598 10.9707C21.9038 10.1048 21.7205 9.27487 21.4285 8.49994" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M14 6C14 6 15 6 16 8C16 8 19.1765 3 22 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M8.5 15H15.5M8.5 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
      },
      {
        name: 'Suspender Usuarios',
        href: '/protected/ban',
        description: 'Gestiona usuarios suspendidos',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M14 8.5C14 5.73858 11.7614 3.5 9 3.5C6.23858 3.5 4 5.73858 4 8.5C4 11.2614 6.23858 13.5 9 13.5C11.7614 13.5 14 11.2614 14 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M20.9526 9.54744L17.065 13.435M22 11.5C22 13.1569 20.6569 14.5 19 14.5C17.3431 14.5 16 13.1569 16 11.5C16 9.84315 17.3431 8.5 19 8.5C20.6569 8.5 22 9.84315 22 11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M16 20.5C16 16.634 12.866 13.5 9 13.5C5.13401 13.5 2 16.634 2 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      },
      {
        name: 'Ver plantilla de correo',
        href: '/protected/seeEmailTemplate',
        description: 'Accede a la plantilla de correo',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M7.00235 7.75L9.94437 9.48943C11.6596 10.5035 12.3451 10.5035 14.0603 9.48943L17.0023 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M21.9977 10.75V9.77844C21.9323 6.71114 21.8996 5.17749 20.7679 4.04141C19.6361 2.90532 18.061 2.86574 14.9107 2.78659C12.9692 2.73781 11.0467 2.7378 9.10511 2.78658C5.95487 2.86573 4.37975 2.9053 3.24799 4.04139C2.11624 5.17748 2.08353 6.71113 2.01812 9.77843C1.99709 10.7647 1.99709 11.7451 2.01812 12.7314C2.08354 15.7987 2.11624 17.3323 3.248 18.4684C4.37975 19.6045 5.95487 19.6441 9.10512 19.7232C9.57337 19.735 10.5358 19.7439 11.0024 19.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M20.8546 13.6893L21.547 14.3817C22.1327 14.9675 22.1327 15.9172 21.547 16.503L17.9196 20.1987C17.6342 20.484 17.2692 20.6764 16.8725 20.7505L14.6244 21.2385C14.2694 21.3156 13.9533 21.0004 14.0294 20.6452L14.5079 18.4099C14.582 18.0132 14.7743 17.6482 15.0597 17.3629L18.7333 13.6893C19.3191 13.1036 20.2688 13.1036 20.8546 13.6893Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      },
      {
        name: 'Estadísticas de la plataforma',
        href: '/protected/stats',
        description: 'Accede a las estadísticas de la plataforma',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M21 21H10C6.70017 21 5.05025 21 4.02513 19.9749C3 18.9497 3 17.2998 3 14V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          <path d="M13 10L13 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M18 13L18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M8 13L8 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M21 7.98693C19.16 7.98693 17.1922 8.24252 15.8771 6.49346C14.3798 4.50218 11.6202 4.50218 10.1229 6.49346C8.80782 8.24252 6.84003 7.98693 5 7.98693H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      },
      {
        name: 'Enviar dinero a un usuario',
        href: '/protected/withdraw',
        description: 'Envía dinero a un usuario específico',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M2.01733 17.4993C4.2169 17.4993 6.00001 19.2824 6.00001 21.4819" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M18 21.4819V21.39C18 19.2412 19.742 17.4993 21.8908 17.4993" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M6.00001 7.5166C6.00001 9.71617 4.2169 11.4993 2.01733 11.4993" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M18 7.5166C18 9.69692 19.769 11.468 21.9423 11.4989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M17 7.50098C19.175 7.51308 20.3529 7.60953 21.1213 8.37792C22 9.2566 22 10.6708 22 13.4992V15.4992C22 18.3277 22 19.7419 21.1213 20.6206C20.2426 21.4992 18.8284 21.4992 16 21.4992H8C5.17157 21.4992 3.75736 21.4992 2.87868 20.6206C2 19.7419 2 18.3277 2 15.4992V13.4992C2 10.6708 2 9.2566 2.87868 8.37792C3.64706 7.60953 4.82497 7.51308 7 7.50098" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M15 14.4993C15 16.1561 13.6569 17.4993 12 17.4993C10.3431 17.4993 9 16.1561 9 14.4993C9 12.8424 10.3431 11.4993 12 11.4993C13.6569 11.4993 15 12.8424 15 14.4993Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M9.5 5.00098C9.5 5.00098 11.2998 2.50098 12 2.50098C12.7002 2.50098 14.5 5.00098 14.5 5.00098M12 8.00098V3.00098" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      },
      {
        name: 'Gestionar envíos',
        href: '/protected/manageShipping',
        description: 'Administra los envíos de la plataforma',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
        <path d="M19.5 17.5C19.5 18.8807 18.3807 20 17 20C15.6193 20 14.5 18.8807 14.5 17.5C14.5 16.1193 15.6193 15 17 15C18.3807 15 19.5 16.1193 19.5 17.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 17.5C9.5 18.8807 8.38071 20 7 20C5.61929 20 4.5 18.8807 4.5 17.5C4.5 16.1193 5.61929 15 7 15C8.38071 15 9.5 16.1193 9.5 17.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.5 17.5H9.5M19.5 17.5H20.2632C20.4831 17.5 20.5931 17.5 20.6855 17.4885C21.3669 17.4036 21.9036 16.8669 21.9885 16.1855C22 16.0931 22 15.9831 22 15.7632V13C22 9.41015 19.0899 6.5 15.5 6.5M15 15.5V7C15 5.58579 15 4.87868 14.5607 4.43934C14.1213 4 13.4142 4 12 4H5C3.58579 4 2.87868 4 2.43934 4.43934C2 4.87868 2 5.58579 2 7V15C2 15.9346 2 16.4019 2.20096 16.75C2.33261 16.978 2.52197 17.1674 2.75 17.299C3.09808 17.5 3.56538 17.5 4.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
      },
      {
        name: 'Gestionar mensajes',
        href: '/protected/manageMessages',
        description: 'Administra los mensajes de la plataforma',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
        <path d="M11.5 3.00366C10.9383 3.01202 10.3789 3.03449 9.8294 3.07102C5.64639 3.34908 2.31441 6.72832 2.04024 10.9707C1.98659 11.8009 1.98659 12.6606 2.04024 13.4908C2.1401 15.0359 2.82343 16.4665 3.62791 17.6746C4.09501 18.5203 3.78674 19.5758 3.30021 20.4978C2.94941 21.1625 2.77401 21.4949 2.91484 21.735C3.05568 21.9752 3.37026 21.9828 3.99943 21.9981C5.24367 22.0284 6.08268 21.6757 6.74868 21.1846C7.1264 20.906 7.31527 20.7668 7.44544 20.7508C7.5756 20.7347 7.83177 20.8403 8.34401 21.0512C8.8044 21.2408 9.33896 21.3579 9.8294 21.3905C11.2536 21.4851 12.7435 21.4853 14.1706 21.3905C18.3536 21.1124 21.6856 17.7332 21.9598 13.4908C22.0134 12.6606 22.0134 11.8009 21.9598 10.9707C21.9038 10.1048 21.7205 9.27487 21.4285 8.49994" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M14 6C14 6 15 6 16 8C16 8 19.1765 3 22 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M8.5 15H15.5M8.5 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
      }
    ]
  }, [])

  return (
    <div className='funcionalidadesAdminContainer'>
      <h1>Funcionalidades de Administrador</h1>
      <div className='userExtraInfo'>
        {options.map((option, index) => (
            <a href={option.href} key={index} style={{ width: '100%' }}>
              <div className='box' key={index}>
                <div className='iconContainer'>
                  {option.icon}
                </div>
                <div className='boxDescription'>
                  <h2>{option.name}</h2>
                  <h3>{option.description}</h3>
                </div>
              </div>
            </a>
          ))}
      </div>
    </div>
  )
}