import JSON2 from "./index";

// describe('JSONparser tests', function () {

//     it.todo("")
// });


console.log(new JSON2({}, [{name: "Extension", parse: function(...args: any[]) {
    console.log(args)
    return 1
}, stringify: function() {}, canStringify: () => false}])._extension.parse('Extension("data1", "2")'))