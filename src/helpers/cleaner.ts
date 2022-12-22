export default function ucwords(str){
    return (str + '' || str).replace(/^([a-z])|\s+([a-z])/g, function ($1) {	
        return $1.toUpperCase();

    });
}