let $ = require('jquery')
let plugins = require('./plugins')

class TestClass {
	
}

function decorator() {
	return x => x
}

@decorator
class DecoratedTestClass {
	
}
