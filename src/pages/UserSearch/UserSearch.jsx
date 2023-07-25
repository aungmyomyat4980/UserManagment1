import React, { useEffect, useState } from "react";
import styles from "../../styles/UserSearch.module.css";
import UserSearchtable from "./UserSearchtable";
import { getTeams, getUsers } from "../../api/api";
import { Button, Form, Input, Select } from "antd";

const UserSearch = ({ loginUser }) => {
  const [userData, setUserData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const teams = await getTeams();
      const filteredTeam = teams.filter((team) => team.del_flg === "0");
      setUserData(users);
      setTeamData(filteredTeam);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    const { firstName, lastName, email, role, team } = values;
  
    let newData = [...userData]; // Create a copy of userData array
  
    newData = newData.filter((user) => {
      const firstNameMatch = !firstName || user.user_name.includes(firstName);
      const lastNameMatch = !lastName || user.user_name_last.includes(lastName);
      const emailMatch = !email || user.email.includes(email);
      const roleMatch = !role || user.user_level === role || role.toLowerCase() === "all";
      const teamMatch = !team || user.team_name === team || team.toLowerCase() === "all";
      const delFlgMatch = user.del_flg === "0"; // Check if del_flg is "0"
  
      return (
        firstNameMatch &&
        lastNameMatch &&
        emailMatch &&
        roleMatch &&
        teamMatch &&
        delFlgMatch
      );
    });
  
    setFilteredData(newData); // Update the filteredData state
  };
  
  const allTeam = {
    id: "all",
    team_name: "All",
  };
  const combinedTeamData = [allTeam, ...teamData];
  const teamOptions = combinedTeamData.map((team) => ({
    value: team.team_name,
    label: team.team_name,
  }));
  return (
    <div className={styles["usermanagement-form-main"]}>
      <div className={styles["usermanagement-form-container"]}>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleSearch}
          initialValues={{
            // Use initialValues prop instead of defaultValue
            firstName:
              loginUser[0].user_level === "member"
                ? loginUser[0].user_name
                : "",
            lastName:
              loginUser[0].user_level === "member"
                ? loginUser[0].user_name_last
                : "",
            email:
              loginUser[0].user_level === "member" ? loginUser[0].email : "",
            role:
              loginUser[0].user_level === "member"
                ? loginUser[0].user_level
                : undefined,
            team:
              loginUser[0].user_level === "member"
                ? loginUser[0].team_name
                : undefined,
          }}
        >
          <Form.Item label="ユーザー名[姓]" name="firstName">
            <Input
              disabled={loginUser[0].user_level === "member"}
              className={styles["usermanagement-input"]}
            />
          </Form.Item>
          <Form.Item label="ユーザー名[名]" name="lastName">
            <Input
              disabled={loginUser[0].user_level === "member"}
              className={styles["usermanagement-input"]}
            />
          </Form.Item>
          <Form.Item label="メールアドレス" name="email">
            <Input
              className={styles["usermanagement-input"]}
              disabled={loginUser[0].user_level === "member"}
            />
          </Form.Item>

          <Form.Item label="ユーザー権限" name="role">
            <Select
              className={styles["usermanagement-input"]}
              options={[
                { value: "all", label: "All" },
                { value: "admin", label: "Admin" },
                { value: "super admin", label: "Super Admin" },
                { value: "member", label: "Member" },
              ]}
              disabled={loginUser[0].user_level === "member"}
            />
          </Form.Item>
          <Form.Item label="チーム名：" name="team">
            <Select
              className={styles["usermanagement-input"]}
              options={teamOptions}
              disabled={loginUser[0].user_level === "member"}
            />
          </Form.Item>

          <Form.Item className={styles["usermanagement-form-button-container"]}>
            {loginUser[0].user_level === "member" ? (
              <Button type="primary" disabled>
                検索
              </Button>
            ) : (
              <Button type="primary" htmlType="submit">
                検索
              </Button>
            )}
          </Form.Item>
        </Form>
      </div>
      <div className={styles["usermanagement-table-main"]}>
        <UserSearchtable
          loginUser={loginUser}
          data={filteredData}
          loading={loading}
          fetchUsers={fetchUsers}
        />
      </div>
    </div>
  );
};

export default UserSearch;
