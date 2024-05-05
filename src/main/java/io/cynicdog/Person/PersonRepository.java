package io.cynicdog.Person;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.inc;

@ApplicationScoped
public class PersonRepository {

    private final MongoClient mongoClient;
    private final MongoCollection<Person> collection;


    public PersonRepository(MongoClient mongoClient) {
        this.mongoClient = mongoClient;
        this.collection = mongoClient.getDatabase("akouo").getCollection("people", Person.class);
    }

    public String add(Person person) {
        return collection.insertOne(person).getInsertedId().asObjectId().getValue().toHexString();
    }

    public List<Person> getPersons() {
        return collection.find().into(new ArrayList<>());
    }

    public long anniversaryPerson(String id) {
        Bson filter = eq("_id", new ObjectId(id));
        Bson update = inc("age", 1);
        return collection.updateOne(filter, update).getModifiedCount();
    }

    public long deletePerson(String id) {
        Bson filter = eq("_id", new ObjectId(id));
        return collection.deleteOne(filter).getDeletedCount();
    }
}
