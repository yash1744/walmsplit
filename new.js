console.log(expenses);
var string = `--------------- WalmartExpenseTracker --------------
ItemName                                      Amount\n
`;
individualItems.forEach((_, id) => {
  string += `${allPersons.get(id)} split\n`;
  individualItems.get(id).forEach((item) => {
    var name = items[item["id"]].name + " ".repeat(30);
    string += `${name.slice(0, 40)}        ${item["price"]}\n`;
  });
  string += " ".repeat(48) + expenses.get(id) + "\n\n";
});
console.log(string);
