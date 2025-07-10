import { useContext, useRef, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useReturnIfNoUser } from "../../assets/useReturnIfNoUser";
import axios from "axios";
import { BACKEND_URL } from "../../assets/config";

export default function ProtectedManageMessages() {
  const [messages, setMessages] = useState([]);
  const { user, loading } = useContext(UserContext)
  const debounceRef = useRef(null)
  useReturnIfNoUser(user, loading, true)
  async function fetchData (e) {
    const query = e.target.value ?? ''

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const response = await axios.get(`${BACKEND_URL}/api/messages/query/${query}`)
      const messagesData = response.data
      const users = await axios.get(`${BACKEND_URL}/api/users/idList/${messagesData.map(m => m.user_id).join(',')}`)
      setMessages(messagesData.map(m => ({
        ...m,
        user: users.data.find(u => u.id === m.user_id)
      })))
    }, 500) // 500ms debounce
  }

  return (
    <div className="protectedContainer">
      <h1>Gestionar mensajes</h1>
      <input type="text" onChange={fetchData} />
      <table>
        <thead>
          <tr>
            <th>Mensaje ID</th>
            <th>Mensaje</th>
            <th>Usuario ID</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado cuenta</th>
            <th>Validado</th>
            <th>Fecha registro</th>
            <th>Login</th>
            <th>Ubicación</th>
            <th>Leído</th>
            <th>Fecha mensaje</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <td>{message.id}</td>
              <td>{message.message}</td>
              <td>{message.user?.id}</td>
              <td>{message.user?.nombre}</td>
              <td>{message.user?.rol}</td>
              <td>{message.user?.estado_cuenta}</td>
              <td>{message.user?.validated ? "Sí" : "No"}</td>
              <td>{message.user?.fecha_registro ? new Date(message.user.fecha_registro).toLocaleDateString() : ""}</td>
              <td>{message.user?.login}</td>
              <td>{message.user?.ubicacion?.ciudad ?? ""}</td>
              <td>{message.read ? "Sí" : "No"}</td>
              <td>{new Date(message.created_in).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
