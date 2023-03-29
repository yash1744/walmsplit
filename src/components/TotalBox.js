import axios from "axios";
import React from "react";

const TotalBox = ({
  GlobalActivePersonsIds,
  personItemList,
  items,
  allPersons,
}) => {
  const tax = 8.25;
  const individualItems = new Map();
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
    const prices = splitEqual(parseFloat(itemprice.toFixed(2)), Item.id.length);
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
        individualItems.get(id).push({ id: idx, price: prices[0] });
        prices.shift();
      }
    });
  });

  const individualExpenses = Array.from(expenses, ([_, value]) => value);
  let total = 0;
  if (individualExpenses.length > 0) {
    total = individualExpenses.reduce((a, b) => a + b, 0).toFixed(2);
  }

  // check if all items are checked
  function allChecked() {
    console.log(personItemList);
    const temp = personItemList.find((item) => {
      return item["id"].length === 0 ? true : false;
    });
    if (temp) {
      alert("Please select all items");
    }

  }
  console.log({ personItemList, expenses, items, individualItems });

  // Commit the split to the backend
  function commitSplit(comment) {
   
    let des = prompt("Please enter a description for the split:");
    const expense = {
      cost: total,
      description: des,
      details: comment,
      date: new Date(),
      repeat_interval: "never",
      currency_code: "USD",
      group_id: 0,
    };
    expense[`users__${0}__user_id`] = GlobalActivePersonsIds[0];
    expense[`users__${0}__paid_share`] = total;
    expense[`users__${0}__owed_share`] = expenses.get(
      GlobalActivePersonsIds[0]
    );
    GlobalActivePersonsIds.forEach((id, idx) => {
      if (idx === 0) return;
      expense[`users__${idx}__user_id`] = id;
      expense[`users__${idx}__paid_share`] = 0;
      expense[`users__${idx}__owed_share`] = expenses.get(id);
    });
    expense["users__{index}__{property}1"] = "string";
    expense["users__{index}__{property}2"] = "string";
    console.log(expense);

    const access_token = localStorage.getItem("access_token")
      ? localStorage.getItem("access_token")
      : " ";

    axios({
      method: 'post',
      url: `${process.env.REACT_APP_URL}/create_expense`,
      headers: {
        'content-type': 'application/json',
         Authorization: `Bearer ${access_token}` 
      },
      data: {
        expense: expense
      }
    })
      .then(result => {
        // console.log(result.data);
        if (result.status === 200) {
          console.log(result.data);
          alert("Split added successfully. Redirecting to home page");
          window.location.href = "/";
        }
        else {
          alert("Something went wrong. Please try again later");
          return;
        }
      })
      .catch(error => {
        alert("Something went wrong. Please try again later");
      });
  }

  return (
    <div className="shadow-lg bg-white p-4" style={{width:"80%"}}>
      <div className="font-bold mb-4">Overall Expenses</div>

      {GlobalActivePersonsIds.map((id) => {
        console.log(allPersons);
        return (
          <div key={id} className="flex">
            {" "}
            <div className="flex-1"> {allPersons.get(id)} </div>
            <div className="text-gray-600 font-bold "> {expenses.get(id)}</div>
          </div>
        );
      })}
      <div className="flex mt-4">
        <div key="totaltax" className="font-bold  flex-1">
          Total Tax
        </div>{" "}
        <div className="font-bold">{totalTax.toFixed(2)}</div>
      </div>
      <div className="flex">
        <div key="total" className="font-bold  flex-1">
          Total
        </div>{" "}
        <div className="font-bold">{total}</div>
      </div>

      <button
        onClick={() => {
          allChecked()
          console.log(
            "comments",
           
          );
        }}
        className="hoverbutton dark w-full mt-4 "
      >
        commit split
      </button>
    </div>
  );
};

export default TotalBox;



// Function to split the price equally
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

function getIndividualComments(allPersons,items, individualItems,expenses) {
  console.log(expenses)
  var string = `--------------- WalmartExpenseTracker --------------
ItemName                                      Amount\n
`;
  individualItems.forEach((_, id) => {
    string += `${allPersons.get(id)} split\n`;
    individualItems.get(id).forEach((item) => {
      var name = items[item["id"]].name + " ".repeat(30);
      string += `${name.slice(0,40)}        ${item["price"]}\n`;
    });
    string += " ".repeat(48) + expenses.get(id) + "\n\n";
  });
  console.log(string);
}
