import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { notification } from "antd";

const newEntryManager = () => {
  const [allSheets, setallSheets] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [formValues, SetFormValues] = useState(null);
  const [access_token, setaccess_token] = useCookies(["access_token"]);
  const router = useRouter();

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
    console.log("sheet names",sheetData.data)
    let newData = {}    
    sheetData.data.forEach((item)=>{
           newData[item.name]  = {
            value: "",
            name: item.name,
          }
        })
        console.log("}}}}}}}}}}}}}}}}}}}",newData)
    SetFormValues(newData);
  };

  const onChangeSetValues = (value, name) => {
    SetFormValues((old) => {
      return{
        ...old,
        [name]:{
          ...old[name],
          value
      }}
    });
    console.log(formValues);
  };

  const handleSubmit = async () => {
    console.log(formValues);
    let data = []
    for(const key in formValues){
      if(formValues[key].value == ""){
        notification.error({
          message: `Please fill all the fields ${formValues[key].name}`,
        });
        return;
      }else{
        data.push({
          value: formValues[key].value,
          name: formValues[key].name,
        })
      }
    }
    const sheetData = await axios.post(
      `http://localhost:3000/appendDataToSheet/${selectedSheet}`,
      formValues
    );
    // console.log(sheetData);
    // if (sheetData.status == 200) {
    //   notification.success(sheetData.data.message);
    // }
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
    if (allSheets) {
      setSelectedSheet(allSheets[0].id);
    }
  }, [allSheets]);

  useEffect(() => {
    const token = document.cookie.split("token=");
    // console.log("access_token",access_token.refresh_token)
    if (access_token.refresh_token) {
      getSpreedSheetsFunc();
    } else {
      reqHandler();
    }
  }, []);

  return (
    <div>
      <div className="formbold-main-wrapper">
        <div className="formbold-form-wrapper">
          <div className="formbold-form-title">
            <h2 className="">Add new Entries</h2>
            <p>
              Streamline Your Data: Add New Entries Effortlessly with Krishna
              Roadlines!
            </p>
          </div>

          <div className="formbold-mb-3">
            <label className="formbold-form-label">Select Sheet Name</label>

            <select onChange={(e) => setSelectedSheet(e.target.value)} className="formbold-form-input" name="sheetName" id="sheetName">
              {allSheets?.map((name) => {
                return (
                  <option key={name.id} value={name.id}>
                    {name.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="formbold-input-flex">
            <div>
              <label htmlFor="date" className="formbold-form-label">
                {" "}
                Date{" "}
              </label>
              <input
                type="date"
                name="date"
                id="date"
                onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.date?.value}
                className="formbold-form-input"
              />
            </div>
            <div>
              <label htmlFor="vehicle no" className="formbold-form-label">
                {" "}
                Vehicle No{" "}
              </label>
              <input
                type="text"
                name="vehicle no"
                id="vehicle no"
                onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.["vehicle no"]?.value}
                className="formbold-form-input"
              />
            </div>
          </div>
          <div className="formbold-input-flex">
            <div>
              <label htmlFor="from" className="formbold-form-label">
                {" "}
                From{" "}
              </label>
              <input
                type="text"
                name="from"
                id="from"
                onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.from?.value}
                className="formbold-form-input"
              />
            </div>
            <div>
              <label htmlFor="to" className="formbold-form-label">
                {" "}
                To{" "}
              </label>
              <input
                type="to"
                name="to"
                id="to"
                className="formbold-form-input"
              />
            </div>
          </div>
          <div className="formbold-input-flex">
            <div>
              <label htmlFor="freight" className="formbold-form-label">
                {" "}
                Freight{" "}
              </label>
              <input
                type="number"
                name="freight"
                id="freight"
                onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.freight?.value}
                className="formbold-form-input"
              />
            </div>
            <div>
              <label htmlFor="advance" className="formbold-form-label">
                {" "}
                Advance{" "}
              </label>
              <input
                type="number"
                name="advance"
                id="advance"
                onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.advance?.value}
                className="formbold-form-input"
              />
            </div>
            <div>
              <label htmlFor="balance" className="formbold-form-label">
                {" "}
                Balance{" "}
              </label>
              <input
                type="balance"
                name="balance"
                id="balance"
                onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.balance?.value}
                className="formbold-form-input"
              />
            </div>
          </div>

          <div className="formbold-mb-3">
            <label htmlFor="extra" className="formbold-form-label">
              Extra Charges
            </label>
            <input
              type="text"
              name="extra"
              id="extra"
              onChange={(e) => {onChangeSetValues(e.target.value, e.target.name)}}
                value={formValues?.extra?.value}
              className="formbold-form-input"
            />
          </div>
          <button onClick={handleSubmit} className="formbold-btn">Add Entry</button>
        </div>
      </div>
    </div>
  );
};

export default newEntryManager;
