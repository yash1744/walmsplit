import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import ToggleBox from "../components/ToggleBox";
import { ItemBox } from "../components/ItemBox";
import TotalBox from "../components/TotalBox";
import { personitemListContext } from "../App";
import Nav from "../components/Nav";
var axios = require("axios");

export const HomePage = () => {
  const [allPersons, setAllPersons] = useState(new Map());
  // stores id of all active persons
  const [GlobalActivePersonsIds, setGlobalActivePersonsIds] = useState([]);
  const [personItemList, setPersonItemList] = useState([]);
  const [items, setItems] = useState([]);
  console.log({ GlobalActivePersonsIds });
  //to get query params
  useEffect(() => {
    const access_token = localStorage.getItem("access_token")
      ? localStorage.getItem("access_token")
      : " ";
    axios
      .get(`${process.env.REACT_APP_URL}/get_friends`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then((res, err) => {
        if (res) {
          setAllPersons((persons) => {
            const newpersons = new Map(persons);
            res.data.map((person) => {
              newpersons.set(person.id.toString(), person.name);
            });
            return newpersons;
          });
        }
        if (err) console.log(err);
      });

    axios
      .get("http://localhost:3001/get_current_user", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then((res, err) => {
        if (res) {
          setAllPersons((persons) => {
            const newpersons = new Map(persons);
            newpersons.set(res.data.id.toString(), res.data.name);
            return newpersons;
          });
        }
        if (err) console.log(err);
      });
  }, []);

  useEffect(() => {
    const tax = 8.25;
    let totalTax = 0;
    const expenses = new Map();
    GlobalActivePersonsIds.forEach((id) => {
      expenses.set(id, 0);
    });
    personItemList.forEach((Item, idx) => {
      const itemprice =
        parseFloat(items[idx].price) +
        (Item.tax ? parseFloat(items[idx].price) * (tax / 100) : 0);
      totalTax += Item.tax ? parseFloat(items[idx].price) * (tax / 100) : 0;
      console.log(idx, itemprice.toFixed(2));
      console.log(expenses);
      const prices = splitEqual(
        parseFloat(itemprice.toFixed(2)),
        Item.id.length
      );
      console.log(prices);
      const sortedExpenses = new Map(
        [...expenses.entries()].sort((a, b) => a[1] - b[1])
      );
      console.log(sortedExpenses);
      sortedExpenses.forEach((value, id) => {
        console.log(value, id);
        if (Item.id.includes(id)) {
          let temp = parseFloat((expenses.get(id) + prices[0]).toFixed(2));
          expenses.set(id, temp);
          prices.shift();
        }
      });
    });
    console.log(expenses, Object.fromEntries(expenses), totalTax.toFixed(2));
    const array = Array.from(expenses, ([name, value]) => value);
    if (array.length > 0) {
      console.log(array.reduce((a, b) => a + b, 0).toFixed(2));
    }
  }, [personItemList]);
  return (
    <div>
      <Nav/>
      <div
        className="flex justify-around  pl-4   "
        style={{ height: "calc(100vh - 3.5rem) " }}
      >
        {" "}
        <div style={{ height: "calc(100% - 1.5rem) " , overflowY:"auto"}} className="scroll">
          <ToggleBox
            allPersons={allPersons}
            activePersonsHandler={setGlobalActivePersonsIds}
            activePersons={GlobalActivePersonsIds}
          ></ToggleBox>
          <ItemBox
            items={items}
            allPersons={allPersons}
            setItems={setItems}
            GlobalActivePersonsIds={GlobalActivePersonsIds}
            personItemList={personItemList}
            setPersonItemList={setPersonItemList}
          />
        </div>
        <TotalBox
          GlobalActivePersonsIds={GlobalActivePersonsIds}
          personItemList={personItemList}
          items={items}
          allPersons={allPersons}
        />
      </div>
    </div>
  );
};

function splitEqual(price, quantity) {
  const ans = [];
  const transformedprice = Math.round(price * 100);
  let individualprice = Math.floor(transformedprice / quantity);
  for (let i = 0; i < quantity; i++) {
    ans.push(individualprice);
  }

  const extraprice = transformedprice - individualprice * quantity;
  for (let i = 0; i < extraprice; i++) {
    ans[i] += 1;
  }
  return ans.map((price) => price / 100);
}
