Object.observe
==============

Object.observe give you possibility to watch the changes of object member or of the whole object it self.


---
[Execute tests link](http://htmlpreview.github.io/?https://github.com/igorzg/Object.observe/blob/master/test.html)

# Usage

## Create an observer
```javascript
var obj = {a: 0, b: 1, c: [1, 2, 3, 4, 5]};
Object.observe(obj,function (nVal, oVal, name) {
    console.log(nVal, oVal, name)
});
obj.a = 1;
obj.a = 2;
obj.b = 3;
obj.c.pop();
```

## Destroy an observer
```javascript
Object.destroy(obj); // destroy all observers but keep the object as original
Object.destroy(obj, true) // destroy all observers and delete object members
Object.destroy(obj, 'a'); // destroy the a observer
Object.destroy(obj, 'a', true); // destroy a observer and delete the object member
```
## Know issues
Don't use delete keyward to delete the object member.
Eg.
```javascript
delete obj.a; // observer on a will not be destroyed and you will not get an update
// instead of delete use an destroy method
Object.destroy(obj, 'a', true);
```
