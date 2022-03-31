# echo "Download data : fetching latest navigo pointcalls data"
# curl -o data/navigo_all_pointcalls_1789.csv "data.portic.fr/api/pointcalls/?date=1789&format=csv"
# curl -o data/navigo_all_pointcalls_1787.csv "data.portic.fr/api/pointcalls/?date=1787&format=csv"
# echo "Download data : fetching latest navigo flows data"
# curl -o data/navigo_all_flows_1789.csv "data.portic.fr/api/rawflows/?date=1789&format=csv"
# curl -o data/navigo_all_flows_1787.csv "data.portic.fr/api/rawflows/?date=1787&format=csv"

cd datascripts
# for f in *.py; do echo \"execute python script $f\"; done
for f in *.py; do python3 "$f"; echo "execute python script $f"; done