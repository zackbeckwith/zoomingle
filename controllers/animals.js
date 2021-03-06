import { Animal } from "../models/animal.js"
import { Profile } from "../models/profile.js"
import axios from "axios"

function animalSearch(req, res) {
  axios.get(`https://zoo-animal-api.herokuapp.com/animals/rand`)
  .then(animal => {
    res.render('safari', {
      title: 'Safari',
      animal,
      user: req.user,
    })
  })
}

function animalCreate(req, res) {
  Profile.findById(req.user.profile._id, (err,profile) => {
  Animal.find({name: req.body.name}, (err, found) => {
    if(!found.length){
      const animal = new Animal(req.body)
      animal.save()
    }else {
      profile.animals.push(found[0]._id)
      profile.save(err => {
        res.redirect('/zoos')
      })
  }})
  })
}

function index(req, res) {
  Animal.find({})
  .then(animals => {
    res.render('animals/index', {
      title: 'All Animals',
      animals,
  })
  })
  .catch(err => {
    console.log(err)
    res.redirect(`/animals/index}`)
  })
}

function zooShow(req, res) {
  Profile.findById(req.user.profile._id)
  .populate([{
    path: 'zoos',
      populate: {
        path: 'collectedAnimals'
      }  
  }, {
    path: 'animals',
  }
])
  .then(profile => {
    const zoo = profile.zoos.id(req.params.id)
    const animalsNotInZoo = profile.animals.filter(a => !zoo.collectedAnimals.some(b => b.id===(a.id)))
    res.render('zoos/show', {
      title: zoo.name,
      profile,
      zoo,
      animalsNotInZoo
    })
  })
}

function addToZoo(req, res) {
  Profile.findById(req.user.profile._id)
  .then(profile => {
    const zoo = profile.zoos.id(req.params.zooId)
    zoo.collectedAnimals.push(req.body.animalId)
    profile.save()
    .then(() => {
      res.redirect(`/zoos/${req.params.zooId}`)
    })
  })
}

function deleteAnimal(req,res) {
  Profile.findById(req.user.profile._id)
  .then(profile => {
    const zoo = profile.zoos.id(req.params.zooId)
    zoo.collectedAnimals.remove(req.params.animalId)
    console.log(zoo.collectedAnimals)
    profile.save()
    .then(() => {
      res.redirect(`/zoos/${req.params.zooId}`)
    })
  })
}

function deleteZoo(req, res) {
  Profile.findById(req.user.profile._id)
  .then(profile => {
    profile.zoos.remove(req.params.zooId)
    profile.save()
    .then(() => {
      res.redirect(`/profiles/user`)
    })
    .catch(err => {
      console.log(err)
      res.redirect(`/profiles/user`)
    })
  })
}

export {
  animalSearch,
  animalCreate,
  index,
  zooShow,
  addToZoo,
  deleteAnimal as delete,
  deleteZoo
}



