import styles from "../styles/main.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { notification } from "antd";

export default function Home() {
  const [allSheets, setallSheets] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [formValues, SetFormValues] = useState(null);
  const [access_token, setaccess_token] = useCookies(["access_token"]);
  const router = useRouter();
  // const cookieStore = cookies();
  // // const gapiToken = cookieStore.get('token');

  const getSpreedSheets = async () => {
    await axios
      .get("http://localhost:3000/getSpreedSheets")
      .then((sheetNames) => {
        setallSheets(sheetNames.data);
        console.log(sheetNames);
      })
      .catch((err) => {
        console.log("here", err);
        if (err.response.status == 401) {
          axios
            .post("http://localhost:3000/gapi/refreshToken", {
              token: access_token.refresh_token,
            })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
  };

  const getSheetData = async (id) => {
    const sheetData = await axios.get(
      `http://localhost:3000/getSpreedSheetsTitleColumn/${id}`
    );
    console.log(sheetData.data);
    SetFormValues(sheetData.data);
  };

  const onChangeSetValues = (value, name, index) => {
    SetFormValues((old) => {
      const updatedFormValues = [...old];
      updatedFormValues[index] = {
        ...updatedFormValues[index],
        value: value,
      };
      return updatedFormValues;
    });
  };

  const handleSubmit = async () => {
    console.log(formValues);
    const sheetData = await axios.post(
      `http://localhost:3000/appendDataToSheet/${selectedSheet}`,
      formValues
    );
    console.log(sheetData);
    if (sheetData.status == 200) {
      notification.success(sheetData.data.message);
    }
  };

  useEffect(() => {
    if (selectedSheet) {
      getSheetData(selectedSheet);
    }
  }, [selectedSheet]);

  async function genrateNewToken() {
    const responceURL = await axios.get(
      `http://localhost:3000/gapi/generateNewToken`
    );
    if (responceURL.data.url) {
      router.push(responceURL.data.url);
    }
  }

  async function checkForQuerryGetCode() {
    if (router.query.action) {
      let query = router.query.action;
      const responce = await axios.get(`http://localhost:3000/getCode`);
      console.log(responce);
    } else {
      return false;
    }
  }

  async function reqHandler() {
    // const token =await setTokenInLocalStorage()
    const query = await checkForQuerryGetCode();
    if (!query) {
      let res = await genrateNewToken();
      if ((res.status = 200)) {
        getSpreedSheets();
      }
    }
  }
  async function getSpreedSheetsFunc() {
    // const token =await setTokenInLocalStorage()
    let responce = await getSpreedSheets();
    console.log("", responce);
  }

  useEffect(() => {
    if(allSheets){
      setSelectedSheet(allSheets[0].id)
    }
  }, [allSheets]);
  useEffect(() => {
    const token = document.cookie.split('token=')
    // console.log("access_token",access_token.refresh_token)
    if(access_token.refresh_token){
      getSpreedSheetsFunc()
    }else{
      reqHandler()
    }
  }, []);

  return (
    <>
      <div className={styles.parent}>
        <div className={styles.childStyles}>
          <label htmlFor="sheetName">Sheet Name</label>
          <select
            name="sheetName"
            onChange={(e) => setSelectedSheet(e.target.value)}
            value={selectedSheet}
          >
            {allSheets?.map((name) => {
              return (
                <option key={name.id} value={name.id}>
                  {name.name}
                </option>
              );
            })}
          </select>
        </div>
        {formValues?.map((val, index) => {
          if (val.name == "number") {
            return <></>;
          } else {
            return (
              <div key={val.name + "div"} className={styles.childStyles}>
                <label key={val.name + "label"} htmlFor={val.name}>
                  {val.label}
                </label>
                <input
                  type={val.type}
                  value={val.value}
                  key={val.name}
                  onChange={(e) =>
                    onChangeSetValues(e.target.value, e.target.name, index)
                  }
                  name={val.name}
                />
              </div>
            );
          }
        })}

        <div onClick={handleSubmit}>Submit</div>
      </div>
    </>
  );
}
