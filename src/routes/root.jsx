import { Link } from "react-router-dom";

const users = [
  { name: "User 1", userId: "user01" },
  { name: "User 2", userId: "user02" },
  { name: "User 3", userId: "user03" },
  { name: "User 4", userId: "user04" },
];
const Root = () => {
  return (
    <div>
      <h1>Select User</h1>
      <ul>
        {users.map((user) => (
          <li key={user.userId}>
            <Link to={`/notes/${user.userId}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Root;
