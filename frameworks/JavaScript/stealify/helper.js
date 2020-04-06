import Handlebars from 'handlebars'

const GREETING = "Hello, World!";
export const additionalFortune = () => ({
  id: 0,
  message: 'Additional fortune added at request time.'
})

const fortunesTemplateLit = data => `
  <!DOCTYPE html>
  <html>
  <head><title>Fortunes</title></head>
  <body>
  <table>
    <tr>
      <th>id</th>
      <th>message</th>
    </tr>
    {{#fortunes}}
    <tr>
      <td>${data.fortunes.id}</td>
      <td>${data.fortunes.message}</td>
    </tr>
    {{/fortunes}}
  </table>
  </body>
  </html>` 
const fortunesTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html>
<head><title>Fortunes</title></head>
<body>
<table>
  <tr>
    <th>id</th>
    <th>message</th>
  </tr>
  {{#fortunes}}
  <tr>
    <td>{{id}}</td>
    <td>{{message}}</td>
  </tr>
  {{/fortunes}}
</table>
</body>
</html>`)
export const responses = {
  jsonSerialization: (req, res) => {
    const HELLO_OBJ = { message: GREETING };
    res.setHeader('Server', 'Node');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(HELLO_OBJ));
  },
  plaintext: (req, res) => {
    res.setHeader('Server', 'Node');
    res.setHeader('Content-Type', 'text/plain');
    res.end(GREETING);
  },
  routeNotImplemented: (req, res) => {
    res.writeHead(501, {'Content-Type': 'text/plain; charset=UTF-8'});
    const reason = { reason: "`" + req.url + "` is not an implemented route" };
    res.end(JSON.stringify(reason));
  }
}

export const h = {
  additionalFortune,
  fortunesTemplateLit,
  fortunesTemplate,
  addTfbHeaders: (res, headerType) => {
    const headerTypes = {
      plain: 'text/plain',
      json:  'application/json',
      html:  'text/html; charset=UTF-8'
    };
    
    res.setHeader('Server', 'Node');
    res.setHeader('Content-Type', 'application/json');
},
  randomTfbNumber: () => Math.floor(Math.random() * 10000) + 1,
  // fill with 0 from position 2 until position 4 console.log(array1.fill(0, 2, 4));
  fillArray: (value, len) => {
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(value);
    }
    return arr;
  },
  responses


};





export default h;
  
