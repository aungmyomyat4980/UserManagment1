import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Usermanagement from "./pages/Usermanagement/Usermanagement";
import Menu from "./pages/Menu/Menu";
import Teamsetting from "./pages/Teamsetting/Teamsetting";
import UserSearch from "./pages/UserSearch/UserSearch";
import { useForm } from "antd/es/form/Form";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true" ? true : false
  );

  // コンポーネントのマウントに localStorage から loginUsercheck を読み取る
  const [loginUsercheck, setLoginUsercheck] = useState(
    localStorage.getItem("loginUsercheck") === "true" ? true : false
  );
  const [form] = useForm();
  const [loginUser, setLoginUser] = useState([
    {
      _id: "",
      email: "",
      user_level: "",
      user_name: "",
      user_name_last: "",
      team_name: "",
    },
  ]);

  useEffect(() => {
    // isLoggedIn 状態が変更されるたびに、それを localStorage に保存する
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    // 変更されるたびに、loginUsercheck 状態を localStorage に保存する
    localStorage.setItem("loginUsercheck", loginUsercheck);
  }, [loginUsercheck]);

  const handleLogin = (
    email,
    id,
    userLevel,
    userFirstName,
    userLastName,
    userTeam
  ) => {
    setIsLoggedIn(true);
    setLoginUser([
      {
        _id: id,
        email: email,
        user_level: userLevel,
        user_name: userFirstName,
        user_name_last: userLastName,
        team_name: userTeam,
      },
    ]);
  };
  const ProtectedRoute = ({ element: Component, ...props }) => {
    return isLoggedIn ? (
      <Component loginUser={loginUser} {...props} />
    ) : (
      <Navigate to="/" replace={true} />
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Login
              onLogin={handleLogin}
              setLoginUsercheck={setLoginUsercheck}
            />
          }
        />
        <Route
          path="/usermanagement"
          element={<ProtectedRoute element={Usermanagement} />}
        />
        <Route
          path="/teamsetting"
          element={<ProtectedRoute element={Teamsetting} form={form} />}
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute element={Menu} loginUsercheck={loginUsercheck} />
          }
        />
        <Route
          path="/usersearch"
          element={<ProtectedRoute element={UserSearch} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
