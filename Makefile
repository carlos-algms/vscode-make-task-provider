.PHONY: pack publish compile compile_prod compile_test test

#####
# REMEMBER TO INSTALL VSCE GLOBALLY
# yarn global add vsce
#####

# Pack the extension into file that can be installed
pack:
	vsce package


# Publish the extension to VS Code marketplace
# Define the token before executing
# https://code.visualstudio.com/api/working-with-extensions/publishing-extension
publish:
	vsce publish -p $(VSCE_TOKEN)



compile_base = npx esbuild --sourcemap --format=cjs --platform=node --target=node14
compile_extension = $(compile_base) src/extension.ts --outfile=build/extension.js --bundle --external:vscode

compile:
	$(compile_extension)

compile_prod:
	$(compile_extension) --minify --define:process.env.NODE_ENV=\"production\"

compile_test:
	npx rimraf .vscode-test/build
	$(compile_base) `find ./src -name '*.ts'` \
		--outdir='.vscode-test/build' \
		--define:process.env.NODE_ENV=\"test\"

test: NODE_ENV=test
test: TEST_CASE_PATH=`npx realpath src/test/examples/case-1`
test: compile_test
	cp package.json .vscode-test/
	node --enable-source-maps .vscode-test/build/test/runTest.js $(TEST_CASE_PATH)
