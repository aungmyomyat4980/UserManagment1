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

const { Search } = Input;




const Teamsetting = ({ loginUser }) => {

  const [userData, setUserData] = useState([]);

  const [teamData, setTeamData] = useState([]);

  const [searchteamData, setsearchteamData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [clickUsers, setClickUsers] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [user, setUser] = useState([]);

  const [teamSearchInput, setTeamSearchInput] = useState("");

  const [form] = Form.useForm(); // Create a form instance

  const [searchValues, setSearchValues] = useState([]); // State for search input values




  useEffect(() => {

    fetchUsers();

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

      // Check if the user is already in the selectedUsers array

      const userAlreadySelected = selectedUsers.some(

        (selectedUser) => selectedUser._id === userId

      );




      if (!userAlreadySelected) {

        setSelectedUsers((prevSelectedUsers) => [

          ...prevSelectedUsers,

          clickedUser,

        ]);

      } else {

        // If the user is already selected, remove it from the selectedUsers array

        setSelectedUsers((prevSelectedUsers) =>

          prevSelectedUsers.filter((user) => user._id !== userId)

        );

      }

    }

  };




  const onSearch = (value) => {

    // Update the search input value as the user types

    setTeamSearchInput(value);




    // Convert the search input and team names to lowercase for case-insensitive search

    const lowerCaseSearch = value.toLowerCase();




    // Filter the teamData based on the search value

    const filteredTeams = teamData.filter((team) =>

      team.team_name.toLowerCase().includes(lowerCaseSearch)

    );




    // Update the searchteamData state with the filtered teams

    setsearchteamData(filteredTeams);

  };




  const handleFormSubmit = async (values) => {

    const newUserData = userData.map((user) => {

      if (clickUsers.some((clickUser) => clickUser._id === user._id)) {

        return {

          ...user,

          // Set the team_name to the new team for selected users

          team_name: values.teamSelect,

        };

      }

      return user;

    });




    try {

      for (const user of newUserData) {

        const updatedUser = await updateUser(user._id, user);

        console.log("Updated User:", updatedUser);

      }

    } catch (error) {

      console.error("Error updating users:", error);

    }




    // Set the updated userData state with the selected users removed

    setUserData(

      newUserData.filter((user) => user.team_name !== values.teamSelect)

    );

    message.success(Messages.M008);

    setClickUsers([]);

  };




  const handleSearchSubmit = async (values) => {

    const newSearchValue = values.teamSearchInput.trim(); // Trim any leading/trailing spaces from the search input




    // Filter the teamData based on the search value (excluding "なし" team)

    const filteredTeams = teamData.filter(

      (team) =>

        team.team_name !== "なし" && team.team_name.includes(newSearchValue)

    );




    // Update the searchteamData state with the filtered teams

    setsearchteamData(filteredTeams);




    // Close the modal and reset selected users

    setUser([]);

    setClickUsers([]);

    setIsModalVisible(false);

  };




  const handleRightClick = () => {

    if (!loading) {

      setClickUsers((prevUsers) => [...prevUsers, ...selectedUsers]);

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

    // Toggle filter based on team_name

    if (e.target.checked) {

      // Checkbox is checked, add the team_name to the search value

      setSearchValues((prevSearchValues) => [

        ...prevSearchValues,

        record.team_name,

      ]);

    } else {

      // Checkbox is unchecked, remove the team_name from the search value

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

      title: "番号",

      dataIndex: "id",

      key: "id",

      render: (_, record) => (

        <Checkbox

          onChange={(e) => onChange(e, record)}

          checked={searchValues.includes(record.team_name)}

        />

      ),

    },

    {

      title: "チーム名",

      dataIndex: "team_name",

      key: "team_name",

    },

  ];




  // Static data for "なし" team

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




  const paginationConfig = {

    pageSize: 6,

  };




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

                marginLeft: "5px",

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

          >

            <Form>

              <Form.Item label="チーム名">

                <Input

                  style={{ width: "100%" }}

                  placeholder="検索条件入力"

                  name="teamSearchInput"

                  value={teamSearchInput}

                  onChange={(e) => onSearch(e.target.value)} // Connect the onChange event

                />

              </Form.Item>

            </Form>

            <Table

              dataSource={combinedTeamData}

              columns={columns}

              rowKey="id"

              pagination={paginationConfig}

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

          </Modal>

          <Form form={form} onFinish={handleFormSubmit}>

            <Form.Item

              name="teamSelect"

              label="チームに移動"

              className={styles["usermanagement-form-item"]}

            >

              <Select

                style={{ width: "250px" }}

                className={styles["usermanagement-input"]}

                options={teamOptions}

              />

            </Form.Item>

            <div className={styles["teamsetting-box-main"]}>

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

                              (selectedUser) => selectedUser._id === user._id

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

                  <DoubleRightOutlined className={styles["teamsetting-btn"]} />

                </div>

                <div

                  className={styles["teamsetting-btn-container"]}

                  onClick={handleLeftClick}

                >

                  <DoubleLeftOutlined className={styles["teamsetting-btn"]} />

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

            <Form.Item

              style={{

                display: "flex",

                justifyContent: "center",

                marginTop: "20px",

              }}

            >

              <Button type="primary" htmlType="submit">

                決定

              </Button>

            </Form.Item>

          </Form>
        </div>
      </div>
    </>
  );
};
export default Teamsetting;