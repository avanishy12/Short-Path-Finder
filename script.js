onload = function () {
    let curr_data,V,source,destination;

    const container1 = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const temptext1 = document.getElementById('temptext1');
    const temptext2 = document.getElementById('temptext2');
    const cities = ['Delhi', 'Mumbai', 'Gujarat', 'Goa', 'Kanpur', 'Chandigarh','Jammu', 'Jabalpur','Indore', 'Hyderabad', 'Bangalore', 'Chennai', 'Gangtok', 'Meghalaya'];

    // initialising our graph options
    const options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 30
            }
        },
        nodes: {
            font: '12px arial red',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf015',
                size: 35,
                color: '#495C83',
            }
        }
    };

   
    // Network for the question graph
    const network = new vis.Network(container1);


    network.setOptions(options);
    // Network for the result graph
    const network2 = new vis.Network(container2);
    network2.setOptions(options);

    function createData(){
        V = Math.floor(Math.random() * 8) + 5; // Ensures V is between 5 and 12
        let nodes = [];
        for(let i=1;i<=V;i++) nodes.push({id:i, label: cities[i-1]})
        
        nodes = new vis.DataSet(nodes);

        // Creating a tree like underlying graph structure
        let edges = [];
        for(let i=2;i<=V;i++){
            let neighbour = i - Math.floor(Math.random()*Math.min(i-1,3)+1); // Picks a neighbour from i-3 to i-1
            edges.push({type: 0, from: i, to: neighbour, color: 'orange',label: String(Math.floor(Math.random()*70)+31)});
        }

        // Randomly adding new edges to graph
        // Type of bus is 0
        // Type of plane is 1
        for(let i=1;i<=V/2;){

            let n1 = Math.floor(Math.random()*V)+1;
            let n2 = Math.floor(Math.random()*V)+1;
            if(n1!==n2){
                if(n1<n2){
                    let temp = n1;
                    n1 = n2;
                    n2 = temp;
                }
                // if an edge between these two vertices already exits And if it does then of which kind
                let works = 0;
                for(let j=0;j<edges.length;j++){
                    if(edges[j]['from']===n1 && edges[j]['to']===n2) {
                        if(edges[j]['type']===0)
                            works = 1;
                        else
                            works = 2;
                    }
                }

                // Adding edges to the graph
                // If works == 0, you can add bus as well as plane between vertices
                // If works == 1, you can only add plane between them
                if(works <= 1) {
                    if (works === 0 && i < V / 4) {
                        // Adding a bus
                        edges.push({
                            type: 0,
                            from: n1,
                            to: n2,
                            color: 'orange',
                            label: String(Math.floor(Math.random() * 70) + 31)
                        });
                    } else {
                        // Adding a plane
                        edges.push({
                            type: 1,
                            from: n1,
                            to: n2,
                            color: 'green',
                            label: String(Math.floor(Math.random() * 50) + 1)
                        });
                    }
                    i++;
                }
            }
        }

        // Setting the new values of global variables


        source = 1;
        // source = Math.floor(Math.random() * 8) + 2
        destination = V;
        curr_data = {
            nodes: nodes,
            edges: edges
        };
    }

    genNew.onclick = function () {
        // Create new data and display the data
        createData();
        network.setData(curr_data);
        temptext2.innerText = 'Find least time path from '+cities[source-1]+' to '+cities[destination-1];
        temptext1.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";

    };

    solve.onclick = function () {
        // Create graph from data and set to display
        temptext1.style.display  = "none";
        temptext2.style.display  = "none";
        container2.style.display = "inline";
        network2.setData(solveData());
    };

    //  creating graph
    function createGraph(data){
        let graph = [];
        for(let i=1;i<=V;i++){
            graph.push([]);
        }

        for(let i=0;i<data['edges'].length;i++) {
            let edge = data['edges'][i];
            if(edge['type']===1)
                continue;
            graph[edge['to']-1].push([edge['from']-1,parseInt(edge['label'])]);
            graph[edge['from']-1].push([edge['to']-1,parseInt(edge['label'])]);
        }
        return graph;
    }


    // djikstra algorithm function
    function djikstra(graph, size, source) {
        let vis = Array(size).fill(0);
        let dist = [];
        for(let i=1;i<=size;i++)
            dist.push([10000,-1]);
        dist[source][0] = 0;

        for(let i=0;i<size-1;i++){
            let mn = -1;
            for(let j=0;j<size;j++){
                if(vis[j]===0){
                    if(mn===-1 || dist[j][0]<dist[mn][0])
                        mn = j;
                }
            }

            vis[mn] = 1;
            for(let j in graph[mn]){
                let edge = graph[mn][j];
                if(vis[edge[0]]===0 && dist[edge[0]][0]>dist[mn][0]+edge[1]){
                    dist[edge[0]][0] = dist[mn][0]+edge[1];
                    dist[edge[0]][1] = mn;
                }
            }
        }

        return dist;
    }


    function shouldTakePlane(edges, dist1, dist2, mn_dist) {
        let plane = 0;
        let p1=-1, p2=-1;
        for(let pos in edges){
            let edge = edges[pos];
            if(edge['type']===1){
                let to = edge['to']-1;
                let from = edge['from']-1;
                let wght = parseInt(edge['label']);
                if(dist1[to][0]+wght+dist2[from][0] < mn_dist){
                    plane = wght;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0]+wght+dist2[from][0];
                }
                if(dist2[to][0]+wght+dist1[from][0] < mn_dist){
                    plane = wght;
                    p2 = to;
                    p1 = from;
                    mn_dist = dist2[to][0]+wght+dist1[from][0];
                }
            }
        }
        return {plane, p1, p2};
    }

    function solveData() {

        const data = curr_data;

        // Creating adjacency list matrix graph from question data
        const graph = createGraph(data);

        // Applying djikstra from source and destination
        let dist1 = djikstra(graph,V,source-1);
        let dist2 = djikstra(graph,V,destination-1);

        // Initialise min_dist to min distance via bus from source to destination
        let mn_dist = dist1[destination-1][0];

        // See if plane should be used
        let {plane, p1, p2} = shouldTakePlane(data['edges'], dist1, dist2, mn_dist);

        let new_edges = [];
        if(plane!==0){
            new_edges.push({arrows: { to: { enabled: true}}, from: p1+1, to: p2+1, color: 'green',label: String(plane)});
            // Using spread operator to push elements of result of pushEdges to new_edges
            new_edges.push(...pushEdges(dist1, p1, false));
            new_edges.push(...pushEdges(dist2, p2, true));
        } else{
            new_edges.push(...pushEdges(dist1, destination-1, false));
        }
        const ans_data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return ans_data;
    }


    //?? 
    
    function pushEdges(dist, curr, reverse) {
        let tmp_edges = [];
        while(dist[curr][0]!==0){
            let fm = dist[curr][1];
            if(reverse)
                tmp_edges.push({arrows: { to: { enabled: true}},from: curr+1, to: fm+1, color: 'orange', label: String(dist[curr][0] - dist[fm][0])});
            else
                tmp_edges.push({arrows: { to: { enabled: true}},from: fm+1, to: curr+1, color: 'orange', label: String(dist[curr][0] - dist[fm][0])});
            curr = fm;
        }
        return tmp_edges;
    }

    genNew.click();
};
