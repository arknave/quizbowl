ElasticSearchClient = require('elasticsearchclient');

var servopts = {
  host: 'localhost',
  port: 9200,
  secure: false
};

var esc = new ElasticSearchClient(servopts);

exports.search = function(req, res){
  var qryObj = 
  {
    query : {
      filtered: {
        query: {
          query_string: { 
            fields: [
              ['txt', 'ans*', 'part*'],
              ['txt', 'part*'],
              ['ans*']
            ][req.query.loc],
            query: req.query.query, 
            default_operator: "AND",
            }
        },
        filter : {
          and : [
            {  
              range: {
                "tmt.diff" : {gte: req.query.diff[0], lte: req.query.diff[1]}
              }
            },
          ]  
        },
      },
      from: req.query.from,
      size: req.query.size,
    }
  };
  
  if (req.query.subj.length > 1) {
    qryObj.query.filtered.filter.and.push({terms: {subj: req.query.subj}});
  }
  esc.search('questions', ['', 'tossup', 'bonus'][req.query.type], qryObj)
    .on('error', function(err){
      res.send(500, err);
    })
    .on('data', function(data){
      res.send(data);
    })
    .exec();
};

exports.update = function(req, res){
  var q = req.body.q._source;
  q.subj = req.body.newsubj;
  esc.update('questions', req.body.q._type, req.body.q._id, {
    script: "ctx._source.subj = ns",
    params: {
      ns: req.body.newsubj,
    }
  })
    .on('error', function(err){
      res.send(500, err);
    })
    .on('data', function(data){
      res.send(data);
    })
    .exec();
}
