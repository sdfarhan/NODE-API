module.exports.err500 = function(err,res){
    console.log(err);
    res.status(500).json({success: false, message: "An internal server error please try agian!!"});
    return;
}