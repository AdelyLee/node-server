rm -r dist
echo delete dist
rm dist.tar.gz
echo delete dist.tar.gz
webpack -p
echo webpack success
tar -zcvf dist.tar.gz dist
echo zip dist
scp dist.tar.gz root@115.29.103.29:/home/yuqing/node-server/

