import {ObjectLiteral, Repository} from "typeorm";
import dataSource from "@/data-source";
import {EntityTarget} from "typeorm/common/EntityTarget";

export abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {

    protected constructor(entity: EntityTarget<T>) {
        super(entity , dataSource.manager);
    }

}
