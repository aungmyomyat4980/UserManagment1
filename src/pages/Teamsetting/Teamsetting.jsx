import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
} from "antd";
import styles from "../../styles/Teamsetting.module.css";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getTeams, getUsers, updateUser } from "../../api/api";
import { Messages } from "../../data/message";
import { Helmet } from "react-helmet";

const Teamsetting = ({ loginUser, form }) => {
  // ステート変数の定義
  const [userData, setUserData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [searchteamData, setsearchteamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [clickUsers, setClickUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState([]);
  const [teamSearchInput, setTeamSearchInput] = useState("");
  const [searchValues, setSearchValues] = useState([]);
  const pageSize = 6; 
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTeamFromSelectBox, setSelectedTeamFromSelectBox] =
    useState("");

  useEffect(() => {
    fetchUsers();
    return () => {
      setUserData([]);
      setTeamData([]);
      setSelectedUsers([]);
      setClickUsers([]);
      setSearchValues([]);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const teams = await getTeams();
      const filteredData = users.filter((user) => user.del_flg === "0");
      const filteredTeam = teams.filter((team) => team.del_flg === "0");
      setTeamData(filteredTeam);
      setUserData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleClickUser = (userId) => {
    const clickedUser = userData.find((user) => user._id === userId);

    if (clickedUser) {
      const userAlreadySelected = selectedUsers.some(
        (selectedUser) => selectedUser._id === userId
      );
      if (!userAlreadySelected) {
        setSelectedUsers((prevSelectedUsers) => [
          ...prevSelectedUsers,
          clickedUser,
        ]);
      } else {
        setSelectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.filter((user) => user._id !== userId)
        );
      }
    }
  };

  const onSearch = (value) => {
    setTeamSearchInput(value);
    const lowerCaseSearch = value.toLowerCase();
    const filteredTeams = teamData.filter((team) =>
      team.team_name.toLowerCase().includes(lowerCaseSearch)
    );
    setsearchteamData(filteredTeams);
  };

  const handleFormSubmit = async (values) => {
    const newUserData = clickUsers.map((user) => ({
      ...user,
      del_flg: "0",
      update_user: loginUser[0]._id,
      update_datetime: new Date().toISOString(),
      team_name: selectedTeamFromSelectBox,
    }));

    try {
      for (const user of newUserData) {
        await updateUser(user._id, user);
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
    message.success(Messages.M008);
    fetchUsers();
    setClickUsers([]);
    setSelectedTeamFromSelectBox("");
  };

  const handleSearchSubmit = async (values) => {
    const selectedTeam = values.teamSelect === "なし" ? "" : values.teamSelect;
    const newSearchValue = values.teamSearchInput;

    setSearchValues((prevSearchValues) => [
      ...prevSearchValues,
      newSearchValue,
    ]);

    let filteredUserData;
    if (searchValues.includes("なし")) {
      filteredUserData = userData.filter(
        (user) => !user.team_name || searchValues.includes(user.team_name)
      );
    } else {
      filteredUserData = userData.filter(
        (user) => searchValues.includes(user.team_name) && user.team_name
      );
    }

    setUser(filteredUserData);
    setClickUsers([]);
    setIsModalVisible(false);
  };

  const handleRightClick = () => {
    if (!loading) {
      setClickUsers((prevUsers) => {
        const uniqueSelectedUsers = selectedUsers.filter(
          (selectedUser) => !prevUsers.includes(selectedUser)
        );
        return [...prevUsers, ...uniqueSelectedUsers];
      });
      setSelectedUsers([]);
    }
  };

  const handleLeftClick = () => {
    if (!loading) {
      setClickUsers((prevClickUsers) => {
        const updatedClickUsers = prevClickUsers.filter(
          (user) =>
            !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
        );
        return updatedClickUsers;
      });
      setSelectedUsers([]);
    }
  };

  const onChange = (e, record) => {
    if (e.target.checked) {
      setSearchValues((prevSearchValues) => [
        ...prevSearchValues,
        record.team_name,
      ]);
    } else {
      setSearchValues((prevSearchValues) =>
        prevSearchValues.filter((value) => value !== record.team_name)
      );
    }
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: () => <div style={{ textAlign: 'center' }}>番号</div>,
      dataIndex: "id",
      key: "id",
      render: (_, record, index) => (
        <Checkbox onChange={(e) => onChange(e, record, index)}>
          {index + 1 + (currentPage - 1) * pageSize}
        </Checkbox>
      ),
    },
    {
      title: () => <div style={{ textAlign: 'center' }}>チーム名</div>,
      dataIndex: "team_name",
      key: "team_name",
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const noneTeam = {
    id: "none",
    team_name: "なし",
  };

  let combinedTeamData;
  if (teamSearchInput.length === 0) {
    combinedTeamData = [noneTeam, ...teamData];
  } else {
    combinedTeamData = searchteamData;
  }

  const teamOptions = teamData.map((team) => ({
    value: team.team_name,
    label: team.team_name,
  }));

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["teamsetting-main"]}>
        <div className={styles["teamsetting-container"]}>
          <div className={styles["teamsetting-search"]}>
            <label className={styles["teamsetting-label"]}>チーム名 : </label>
            <SearchOutlined
              style={{
                background: "blue",
                color: "#fff",
                padding: "5px",
                fontSize: "20px",
                cursor: "pointer",
                borderRadius: "5px",
                marginLeft: "20px",
              }}
              onClick={handleShowModal}
            />
          </div>
          <Modal
            title="チーム名検索"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            centered
            form={form} // Pass the form instance to the Modal
          >
            <Form>
              <Form.Item label="チーム名">
                <Input
                  style={{ width: "100%" }}
                  placeholder="検索条件入力"
                  name="teamSearchInput"
                  value={teamSearchInput}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </Form.Item>
              <Table
                dataSource={combinedTeamData}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize,
                  onChange: handlePageChange,
                }}
              />
              <Form.Item style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleSearchSubmit}
                >
                  追加
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <div className={styles["div-color"]}>
            <Form form={form} onFinish={handleFormSubmit}>
              <Form.Item
                name="teamSelect"
                className={styles["usermanagement-form-item"]}
              >
                <div>
                  <div className={styles["selectbox-label"]}>
                    <label>チームに移動</label>
                  </div>
                  <Select
                    style={{ width: "250px" }}
                    className={styles["usermanagement-input"]}
                    options={teamOptions}
                    value={
                      selectedTeamFromSelectBox
                    } 
                    onChange={(value) => {
                      form.setFieldsValue({ teamSelect: value });
                      setSelectedTeamFromSelectBox(
                        value
                      );
                    }}
                  />
                </div>
              </Form.Item>
              <Form.Item>
                <div className={styles["teamsetting-box-main"]}>
                  <p htmlFor="teamSelect" className={styles["user-name"]}>
                    ユーザー名 :{" "}
                  </p>
                  <div className={styles["teamsetting-box-container"]}>
                    <div className={styles["teamsetting-box"]}>
                      {loading ? (
                        <div>Loading...</div>
                      ) : (
                        <>
                          {user?.map((user) => (
                            <div
                              onClick={() => handleClickUser(user._id)}
                              className={`${styles["teamsetting-user"]} ${
                                clickUsers.find(
                                  (clickedUser) => clickedUser._id === user._id
                                )
                                  ? styles["none"]
                                  : ""
                              } ${
                                selectedUsers.find(
                                  (selectedUser) =>
                                    selectedUser._id === user._id
                                )
                                  ? styles["selected"]
                                  : ""
                              }`}
                              key={user?._id}
                            >
                              <div>{`${user.user_name} ${user.user_name_last}`}</div>
                              <div>{user.email}</div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles["teamsetting-btn-main"]}>
                    <div
                      className={styles["teamsetting-btn-container"]}
                      onClick={handleRightClick}
                    >
                      <DoubleRightOutlined
                        className={styles["teamsetting-btn"]}
                      />
                    </div>
                    <div
                      className={styles["teamsetting-btn-container"]}
                      onClick={handleLeftClick}
                    >
                      <DoubleLeftOutlined
                        className={styles["teamsetting-btn"]}
                      />
                    </div>
                  </div>
                  <div className={styles["teamsetting-box-container"]}>
                    <div className={styles["teamsetting-box"]}>
                      {clickUsers?.map((user) => (
                        <div
                          className={`${styles["teamsetting-user"]} ${
                            selectedUsers.some(
                              (selectedUser) => selectedUser._id === user._id
                            )
                              ? styles["selected"]
                              : ""
                          }`}
                          onClick={() => handleClickUser(user._id)}
                          key={user?._id}
                        >
                          <div>{`${user.user_name} ${user.user_name_last}`}</div>
                          <div>{user.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Form.Item>
              <Form.Item className={styles["submit-button"]}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={
                    !selectedTeamFromSelectBox || clickUsers.length === 0
                  } 
                >
                  決定
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Teamsetting;
