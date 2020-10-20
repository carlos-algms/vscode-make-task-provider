.PHONY: pack publish

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
