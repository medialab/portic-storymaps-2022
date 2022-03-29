echo "Download data : fetching latest navigo pointcalls data"
curl -o navigo_all_pointcalls_1789.csv "data.portic.fr/api/pointcalls/?date=1789&format=csv"
curl -o navigo_all_pointcalls_1787.csv "data.portic.fr/api/pointcalls/?date=1787&format=csv"
echo "Download data : fetching latest navigo flows data"
curl -o navigo_all_flows_1789.csv "data.portic.fr/api/rawflows/?date=1789&format=csv"
curl -o navigo_all_flows_1787.csv "data.portic.fr/api/rawflows/?date=1787&format=csv"

cd scripts

echo "Process data : smogglage"
python3 smogglage.py