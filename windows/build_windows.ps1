
Set-ExecutionPolicy RemoteSigned
npm run build
npx nodegui-packer --pack ./dist
Write-Host "============================"
Write-Host "WINDOWS EXE BUILT"
Write-Host "============================"
Copy-Item windows\bin\EMDContextMenu.dll deploy\win32\build\Evermore
Copy-Item windows\bin\EMDOverlays.dll deploy\win32\build\Evermore
Remove-Item .\deploy\win32\build\Evermore\qode.exe
Copy-Item windows\bin\qode.exe deploy\win32\build\Evermore\
Copy-Item -Path windows\bin\node_modules -Destination deploy\win32\build\Evermore -Recurse
Write-Host "============================"
Write-Host "COPIED OVERLAY SUPPORT FILES"
Write-Host "============================"
Move-Item .\deploy\win32\build\Evermore\dist\assets .\deploy\win32\build\Evermore\assets
Write-Host "=========================="
Write-Host "DONE!"
Write-Host "============================"