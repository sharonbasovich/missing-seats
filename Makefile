.PHONY: data verify app build test

data:
	python3 etl/build_data.py

verify:
	python3 etl/verify.py

app:
	cd app && npm install && npm run dev

build:
	cd app && npm install && npm run build

test:
	cd app && npm install && npm test
